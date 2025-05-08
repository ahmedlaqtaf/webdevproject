import { NextResponse } from "next/server";
import UserRepo from "../../../../lib/repository/userRepo";

const userRepo = new UserRepo();

export async function GET(request, { params }) {
  try {
    const id = params.id;
    const user = await userRepo.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "User fetch failed =(", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const userData = await request.json();

    const updatedUser = await userRepo.update(id, userData);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "User update failed =(", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    await userRepo.delete(id);
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "User delete failed =(", details: error.message },
      { status: 500 }
    );
  }
}
