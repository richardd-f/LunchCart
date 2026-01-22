import AdminManagementInterface from "@/features/manageAdmin/components/AdminManagementInterface";
import { getUsers } from "@/features/manageAdmin/actions";

export default async function ManageAdminPage(props: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;

  const result = await getUsers(page, query);

  const data = result.success && result.data
    ? result.data
    : { users: [], totalPages: 0, currentPage: 1 };

  return <AdminManagementInterface data={data} initialQuery={query} />;
}