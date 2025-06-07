import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { Database } from '@/types/supabase';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// GET /api/profiles/bulk - Récupérer plusieurs profils par leurs IDs
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids')?.split(',') || [];

  if (ids.length === 0) {
    return NextResponse.json({ error: 'Aucun ID fourni' }, { status: 400 });
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids);

  if (error) {
    console.error('Erreur lors de la récupération des profils:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profiles });
}

// POST /api/profiles/bulk - Mettre à jour plusieurs profils
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Body reçu:', body);

    if (!body.updates || !Array.isArray(body.updates)) {
      console.error('Format invalide:', body);
      return NextResponse.json({ error: 'Format invalide: updates doit être un tableau' }, { status: 400 });
    }

    // Vérifier que tous les objets ont un id
    const invalidUpdates = body.updates.filter((update: ProfileUpdate) => !update.id);
    if (invalidUpdates.length > 0) {
      console.error('Mises à jour invalides:', invalidUpdates);
      return NextResponse.json({ error: 'Toutes les mises à jour doivent avoir un id' }, { status: 400 });
    }

    // Récupérer les profils existants
    const { data: existingProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .in('id', body.updates.map((u: ProfileUpdate) => u.id));

    if (checkError) {
      console.error('Erreur lors de la vérification des profils:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    console.log('Profils existants:', existingProfiles);

    // Vérifier que l'utilisateur est bien le propriétaire de tous les profils
    const unauthorizedProfiles = existingProfiles.filter(p => p.id !== user.id);
    if (unauthorizedProfiles.length > 0) {
      console.error('Profils non autorisés:', unauthorizedProfiles);
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Effectuer les mises à jour
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        body.updates.map((update: ProfileUpdate) => ({
          ...update,
          updated_at: new Date().toISOString()
        }))
      )
      .select();

    if (error) {
      console.error('Erreur lors de la mise à jour des profils:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Profils mis à jour:', data);
    return NextResponse.json({ profiles: data });
  } catch (error: unknown) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur inattendue' }, { status: 500 });
  }
} 