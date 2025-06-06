import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Récupérer l'utilisateur par email
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: user.id });
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de l\'utilisateur' },
      { status: 500 }
    );
  }
} 