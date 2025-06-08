import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('tierlists')
    .select('id, name, is_public, created_at, user_id')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('SESSION', session, sessionError);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { name, is_public, type } = body;
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('tierlists')
    .insert({ name, is_public, user_id: session.user.id, type })
    .select()
    .single();
  if (error) {
    console.error('SUPABASE ERROR', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
} 