import { getPopularGames } from "@/lib/rawg";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Ne pas mettre en cache la route API

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "16");
    const search = searchParams.get("search") || "";
    const upcoming = searchParams.get("upcoming") === "true";

    if (page < 1) {
      return NextResponse.json(
        { error: "Le numéro de page doit être supérieur à 0" },
        { status: 400 }
      );
    }

    const games = await getPopularGames({ page, pageSize, search, upcoming });

    if (!games || !games.results) {
      return NextResponse.json(
        { error: "Aucun jeu trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...games,
      currentPage: page,
      totalPages: Math.ceil(games.count / pageSize),
      pageSize,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des jeux:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des jeux" },
      { status: 500 }
    );
  }
} 