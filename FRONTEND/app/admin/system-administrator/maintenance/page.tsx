import { redirect } from "next/navigation"

export default function MaintenancePage(): never {
  return redirect("/admin/system-administrator/platform-configuration")
}
