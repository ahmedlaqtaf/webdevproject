import { signJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import UserRepo from "@/lib/repository/userRepo";

const userRepo = new UserRepo();

export async function POST(req) {
  const { username, password } = await req.json();
  const user = await userRepo.findByUsernameAndPassword(username, password);

  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signJwt({
    id: user.id,
    role: user.role,
    name: user.username,
  });

  cookies().set("id_token", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ success: true });
}