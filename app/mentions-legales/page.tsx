import React from "react";
import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-100 via-white to-neutral-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-2">
        <section className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-800">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-primary">Mentions légales</h1>
          <div className="space-y-8 text-base leading-relaxed text-neutral-800 dark:text-neutral-200">
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">Édition du site</h2>
              <p>Le présent site, accessible à l&apos;adresse URL <span className="font-semibold">https://www.gam-ex.fr</span> (le « Site »), est édité par :</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Kévin Maublanc, auto-entrepreneur</li>
                <li>Immatriculé(e) au R.C.S. sous le numéro 933381659</li>
                <li>Numéro de SIRET : 93338165900012</li>
                <li>Adresse e-mail : <a href="mailto:kevmaublanc@gmail.com" className="underline">kevmaublanc@gmail.com</a></li>
                <li>Activité principale : Prestataire de service</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">Hébergement</h2>
              <p>Le Site est hébergé par la société Supabase, Inc.</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Dénomination sociale : Supabase, Inc.</li>
                <li>Adresse : 65 CHULIA STREET, #38-02/03, OCBC CENTRE, Singapore 049513</li>
                <li>Contact légal : <a href="mailto:legal@supabase.io" className="underline">legal@supabase.io</a></li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">Directeur de la publication</h2>
              <p>Le Directeur de la publication du Site est Kévin Maublanc.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">Propriété intellectuelle</h2>
              <p>Tous les contenus présents sur le site Game Area (textes, images, vidéos, graphismes, logo, icônes, sons, logiciels...) sont la propriété exclusive de Kévin Maublanc, sauf mention contraire explicite. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Kévin Maublanc.</p>
              <p>Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">Données personnelles</h2>
              <p>Le site Game Area collecte des données personnelles de ses utilisateurs via les formulaires (par exemple : adresse mail, avatar, mot de passe, pseudo).</p>
              <p>Les informations recueillies sont utilisées dans le but de <span className="italic">[Indiquer la ou les finalités : ex: permettre l&apos;accès aux services du site, gérer les comptes utilisateurs, permettre les interactions sur le site, etc.]</span>.</p>
              <p>Conformément aux dispositions du Règlement Général sur la Protection des Données (RGPD), l&apos;utilisateur dispose d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition aux données personnelles le concernant. Pour exercer ces droits, l&apos;utilisateur peut contacter Kévin Maublanc par e-mail à l&apos;adresse : <a href="mailto:kevmaublanc@gmail.com" className="underline">kevmaublanc@gmail.com</a>.</p>
              <p>Une Politique de Confidentialité détaillée est disponible <span className="italic">[Lien vers votre Politique de Confidentialité]</span> expliquant précisément le traitement des données collectées. Il est impératif de créer ce document.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">Cookies</h2>
              <p>Le site Game Area utilise des cookies d&apos;authentification nécessaires au bon fonctionnement du site et à la gestion des sessions utilisateur. [utilisateur]</p>
              <p>Des informations détaillées sur l&apos;utilisation des cookies et la manière de les gérer sont disponibles dans la Politique de Confidentialité <span className="italic">[Lien vers la section Cookies de votre Politique de Confidentialité ou vers une Politique de Cookies dédiée]</span>. Il est recommandé d&apos;avoir une information claire et de recueillir le consentement pour les cookies non strictement nécessaires si vous en ajoutez par la suite.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">Limitation de responsabilité</h2>
              <p>Kévin Maublanc ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l&apos;utilisateur, lors de l&apos;accès au site Game Area.</p>
              <p>Kévin Maublanc décline toute responsabilité quant à l&apos;utilisation qui pourrait être faite des informations et contenus présents sur Game Area.</p>
              <p>Kévin Maublanc s&apos;engage à sécuriser au mieux le site Game Area, cependant sa responsabilité ne pourra être mise en cause si des données indésirables sont importées et installées sur son site à son insu.</p>
              <p>Des espaces interactifs (espace contact ou commentaires) sont à la disposition des utilisateurs. Kévin Maublanc se réserve le droit de supprimer, sans mise en demeure préalable, tout contenu déposé dans cet espace qui contreviendrait à la législation applicable en France, en particulier aux dispositions relatives à la protection des données.</p>
              <p>Le cas échéant, Kévin Maublanc se réserve également la possibilité de mettre en cause la responsabilité civile et/ou pénale de l&apos;utilisateur, notamment en cas de message à caractère raciste, injurieux, diffamant, ou pornographique, quel que soit le support utilisé (texte, photographie ...).</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">Droit applicable et attribution de juridiction</h2>
              <p>Tout litige en relation avec l&apos;utilisation du site Game Area est soumis au droit français. En dehors des cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction aux tribunaux compétents.</p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 