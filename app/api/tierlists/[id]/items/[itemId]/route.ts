import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string; itemId: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, itemId } = params;
  const { data, error } = await supabase
    .from('tierlist_items')
    .select('id, tierlist_id, column_id, item_id, item_type, position')
    .eq('id', itemId)
    .eq('tierlist_id', id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: { id: string; itemId: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, itemId } = params;
  const body = await request.json();
  const { column_id, position } = body;
  if (!column_id) {
    return NextResponse.json({ error: 'Column ID is required' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('tierlist_items')
    .update({ column_id, position })
    .eq('id', itemId)
    .eq('tierlist_id', id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: { id: string; itemId: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, itemId } = params;
  const { error } = await supabase
    .from('tierlist_items')
    .delete()
    .eq('id', itemId)
    .eq('tierlist_id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 