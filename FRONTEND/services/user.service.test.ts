import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    post: vi.fn(),
}))

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        get: vi.fn(),
        post: mocks.post,
        put: vi.fn(),
    },
}))

import { UserService } from './user.service'

describe('UserService onboarding', () => {
    beforeEach(() => {
        mocks.post.mockReset()
        mocks.post.mockResolvedValue({
            data: {
                ok: true,
                message: 'Welcome email sent',
                data: {
                    user: { id: 'user-1', email: 'user@example.com' },
                    welcomeEmail: { status: 'sent' },
                },
            },
        })
    })

    it('creates users without accepting a client-supplied password', async () => {
        const request = {
            email: 'user@example.com',
            username: 'new_user',
            role: 'AUDITOR' as const,
        }

        await UserService.createUser(request)

        expect(mocks.post).toHaveBeenCalledWith('/user/createUser', request)
        expect(mocks.post.mock.calls[0][1]).not.toHaveProperty('password')
    })

    it('uses the authorized regeneration endpoint without returning a password', async () => {
        const response = await UserService.regenerateTemporaryPassword('user-1', 'user@example.com')

        expect(mocks.post).toHaveBeenCalledWith('/user/user-1/regenerate-temporary-password', { confirmation: 'user@example.com' })
        expect(response.data).not.toHaveProperty('temporaryPassword')
        expect(response.data.user).not.toHaveProperty('password')
    })
})
