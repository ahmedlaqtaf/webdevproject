import { NextResponse } from "next/server";
import UserRepo from "../../../../lib/repository/userRepo";

const userRepo = new UserRepo();

export async function GET() {
  try {
    const users = await userRepo.findAll();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userData = await request.json();
    const user = await userRepo.create(userData);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user", details: error.message },
      { status: 500 }
    );
  }
}
