import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { description } = await req.json();
  if (typeof description !== 'string' || description.length > 4000) {
    return NextResponse.json({ error: 'Description invalide' }, { status: 400 });
  }

  const { error } = await supabase
    .from('profiles')
    .update({ description })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 