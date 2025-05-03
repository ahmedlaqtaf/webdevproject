import fs from 'fs/promises';

export async function POST(req) {
  const { username, password } = await req.json();
  const raw = await fs.readFile('data/users.json', 'utf8');
  const users = JSON.parse(raw).users;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return Response.json({ success: false, error: 'Invalid login info' }, { status: 401 });
  }

  return Response.json({ success: true, user });
}