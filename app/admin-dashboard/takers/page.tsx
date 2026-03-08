import { clerkClient } from "@clerk/nextjs/server"
import { TakersClient, type TakerUser } from "./takers-client"

async function loadAllUsers(): Promise<TakerUser[]> {
  const client = await clerkClient()
  const users: TakerUser[] = []
  const limit = 100
  let offset = 0
  let totalCount = 0

  do {
    const response = await client.users.getUserList({ limit, offset })
    totalCount = response.totalCount

    users.push(
      ...response.data.map((user) => {
        const email = user.emailAddresses.find(
          (address) => address.id === user.primaryEmailAddressId
        )?.emailAddress
        const metadataRole = user.publicMetadata?.role
        const role: TakerUser["role"] =
          metadataRole === "admin" || metadataRole === "taker" ? metadataRole : ""

        const mappedUser: TakerUser = {
          id: user.id,
          name:
            [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
            user.username ||
            email ||
            "Unknown user",
          email: email || user.emailAddresses[0]?.emailAddress || "",
          role,
        }

        return mappedUser
      })
    )

    offset += response.data.length
  } while (offset < totalCount)

  return users
}

export default async function Page() {
  const users = await loadAllUsers()

  return <TakersClient users={users} />
}
