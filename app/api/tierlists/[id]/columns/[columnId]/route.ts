import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string; columnId: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, columnId } = params;
  const { data, error } = await supabase
    .from('tierlist_columns')
    .select('id, tierlist_id, label, color, position')
    .eq('id', columnId)
    .eq('tierlist_id', id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: { id: string; columnId: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, columnId } = params;
  const body = await request.json();
  const { label, color, position } = body;
  if (!label) {
    return NextResponse.json({ error: 'Label is required' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('tierlist_columns')
    .update({ label, color, position })
    .eq('id', columnId)
    .eq('tierlist_id', id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: { id: string; columnId: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, columnId } = params;
  const { error } = await supabase
    .from('tierlist_columns')
    .delete()
    .eq('id', columnId)
    .eq('tierlist_id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 