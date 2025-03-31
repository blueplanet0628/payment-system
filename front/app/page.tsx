// app/page.tsx
import { redirect } from 'next/navigation';

export default function LandingPage() {
  redirect('/auth/login')
}
