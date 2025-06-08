import React from "react";
import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";
import Link from "next/link";

export default function CGUPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-100 via-white to-neutral-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-2">
        <section className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-800">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-primary">CONDITIONS GÉNÉRALES D&apos;UTILISATION (CGU)</h1>
          <div className="text-sm text-neutral-500 mb-8 text-center">Date de dernière mise à jour : <span className="italic">08/06/2025</span></div>
          <div className="space-y-8 text-base leading-relaxed text-neutral-800 dark:text-neutral-200">
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">1. Introduction et Objet</h2>
              <p>Les présentes Conditions Générales d&apos;Utilisation (ci-après les &quot;CGU&quot;) ont pour objet de définir les modalités et conditions selon lesquelles les utilisateurs (ci-après les &quot;Utilisateur&quot; ou les &quot;Utilisateurs&quot;) peuvent accéder et utiliser le site internet accessible à l&apos;adresse <span className="font-semibold">https://www.gam-ex.fr</span> (ci-après le &quot;Site&quot;).</p>
              <p>Le Site est édité par Kévin Maublanc, auto-entrepreneur (ci-après les &quot;Éditeur&quot;), dont les informations légales figurent dans les Mentions Légales accessibles sur le Site.</p>
              <p>Le Site a pour objet principal la gestion de librairiede jeux vidéo en ligne, la création de tier list et de mini jeux autour des jeux vidéo.</p>
              <p>L&apos;accès et l&apos;utilisation du Site impliquent l&apos;acceptation sans réserve des présentes CGU par l&apos;Utilisateur. Les CGU constituent un contrat entre l&apos;Éditeur et l&apos;Utilisateur.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">2. Accès au Site</h2>
              <p>Le Site est accessible gratuitement à tout Utilisateur disposant d&apos;un accès à internet. Tous les coûts liés à l&apos;accès au Site (matériel informatique, logiciels, connexion Internet, etc.) sont à la charge de l&apos;Utilisateur.</p>
              <p>Pour accéder à certaines fonctionnalités du Site, l&apos;Utilisateur doit créer un compte dans les conditions définies à l&apos;article 3.</p>
              <p>L&apos;Éditeur met en œuvre tous les moyens raisonnables à sa disposition pour assurer un accès de qualité au Site, mais n&apos;est tenu à aucune obligation d&apos;y parvenir.</p>
              <p>L&apos;Éditeur se réserve le droit de modifier, suspendre ou interrompre l&apos;accès à tout ou partie du Site, à tout moment et sans préavis, notamment pour des raisons de maintenance, de sécurité ou toute autre contrainte technique. L&apos;indisponibilité du Site, quelle qu&apos;en soit la cause ou la durée, ne peut engager la responsabilité de l&apos;Éditeur.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">3. Création de Compte Utilisateur</h2>
              <p>Pour accéder à certaines fonctionnalités telles que <span className="italic">Création de liste et de tier list</span>, l&apos;Utilisateur doit créer un compte personnel.</p>
              <p>Lors de la création du compte, l&apos;Utilisateur s&apos;engage à fournir des informations exactes, complètes et à jour (adresse mail, pseudo, mot de passe, avatar...).</p>
              <p>L&apos;Utilisateur est seul responsable de la confidentialité de son mot de passe et de toutes les activités effectuées sous son compte. L&apos;Utilisateur s&apos;engage à informer immédiatement l&apos;Éditeur de toute utilisation non autorisée de son compte ou de toute autre violation de sécurité. L&apos;Éditeur ne pourra être tenu responsable de toute perte ou dommage résultant du manquement de l&apos;Utilisateur à ses obligations.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">4. Obligations de l&apos;Utilisateur</h2>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Utiliser le Site conformément aux présentes CGU, aux lois en vigueur et à la bonne foi.</li>
                <li>Ne pas utiliser le Site à des fins illégales ou non autorisées.</li>
                <li>Ne pas perturber le fonctionnement du Site, notamment en introduisant des virus ou tout autre code malveillant.</li>
                <li>Ne pas tenter d&apos;accéder sans autorisation à des systèmes informatiques liés au Site.</li>
                <li>Ne pas collecter ou utiliser des données personnelles d&apos;autres Utilisateurs de manière non conforme aux lois en vigueur et à la Politique de Confidentialité du Site.</li>
                <li>Ne pas usurper l&apos;identité d&apos;une autre personne ou entité.</li>
                <li>Ne pas publier de contenu illégal, diffamatoire, injurieux, haineux, raciste, obscène, pornographique, ou qui porterait atteinte aux droits de tiers (droits d&apos;auteur, droit à l&apos;image, vie privée, etc.).</li>
              </ul>
              <p className="mt-2">L&apos;Éditeur se réserve le droit de suspendre ou de résilier le compte de tout Utilisateur ne respectant pas ces obligations, sans préjudice de toute action en justice que l&apos;Éditeur pourrait entreprendre.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">5. Contenu Utilisateur</h2>
              <p>Si le Site permet aux Utilisateurs de publier ou de soumettre du contenu (notes, avis, descriptions...), l&apos;Utilisateur déclare et garantit qu&apos;il dispose de tous les droits et autorisations nécessaires sur ce contenu.</p>
              <p>L&apos;Utilisateur conserve la pleine propriété de son contenu, mais concède à l&apos;Éditeur, pour la durée légale des droits d&apos;auteur et dans le monde entier, le droit non exclusif, transférable, sous-licenciable, gratuit et sans redevance, d&apos;héberger, d&apos;utiliser, de distribuer, de modifier, d&apos;exécuter, de copier, de représenter publiquement, de traduire et de créer des œuvres dérivées de son contenu aux seules fins de fournir et de promouvoir le service du Site.</p>
              <p>L&apos;Utilisateur est seul responsable du contenu qu&apos;il publie ou soumet. L&apos;Éditeur n&apos;assume aucune responsabilité quant au contenu publié par les Utilisateurs.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">6. Propriété Intellectuelle</h2>
              <p>Le Site, son contenu original, ses caractéristiques et ses fonctionnalités sont et restent la propriété exclusive de Kévin Maublanc. Les marques, noms de domaine, logos, textes, images, vidéos et sons présents sur le Site sont protégés par le droit de la propriété intellectuelle et appartiennent à Kévin Maublanc ou font l&apos;objet d&apos;une autorisation d&apos;utilisation.</p>
              <p>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du Site est strictement interdite sans l&apos;autorisation écrite préalable de Kévin Maublanc.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">7. Données Personnelles et Cookies</h2>
              <p>La collecte et le traitement des données personnelles des Utilisateurs du Site sont régis par la Politique de Confidentialité, accessible à <span className="italic"><Link href="/politique-de-confidentialite">ici</Link></span>. En utilisant le Site, l&apos;Utilisateur reconnaît avoir pris connaissance de cette Politique.</p>
              <p>Le Site utilise des cookies, notamment des cookies d&apos;authentification, comme détaillé dans la Politique de Confidentialité ou une Politique de Cookies dédiée, accessible à <span className="italic"><Link href="/politique-de-confidentialite">ici</Link></span>.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">8. Limitation de Responsabilité</h2>
              <p>Le Site est fourni &ldquo;en l&apos;état&ldquo; et &ldquo;selon disponibilité&ldquo;. L&apos;Éditeur ne garantit pas que le Site sera exempt d&apos;erreurs, de bugs, ou qu&apos;il fonctionnera sans interruption.</p>
              <p>L&apos;Éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l&apos;accès ou de l&apos;utilisation du Site, y compris les pertes de données, les dommages matériels, les préjudices financiers.</p>
              <p>L&apos;Éditeur décline toute responsabilité concernant les liens hypertextes présents sur le Site qui renvoient vers des sites tiers. L&apos;Éditeur n&apos;a aucun contrôle sur le contenu de ces sites et ne saurait être tenu responsable de leur contenu ou de leur utilisation.</p>
              <p>L&apos;Éditeur ne saurait être tenu responsable des actions ou omissions des Utilisateurs sur le Site.</p>
              <p>En cas de force majeure, tel que défini par la jurisprudence des tribunaux français, l&apos;exécution des obligations de l&apos;Éditeur pourra être suspendue.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">9. Durée et Résiliation</h2>
              <p>Les présentes CGU s&apos;appliquent pendant toute la durée d&apos;utilisation du Site par l&apos;Utilisateur.</p>
              <p>L&apos;Éditeur se réserve le droit de résilier ou de suspendre l&apos;accès de l&apos;Utilisateur au Site, sans préavis ni indemnité, en cas de manquement aux présentes CGU ou à toute loi ou réglementation applicable.</p>
              <p>L&apos;Utilisateur peut résilier son compte à tout moment en contactant l&apos;Éditeur à l&apos;adresse e-mail indiquée dans les Mentions Légales. La résiliation du compte peut entraîner la suppression de certaines données ou contenus associés au compte.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">10. Modification des CGU</h2>
              <p>L&apos;Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prendront effet dès leur publication sur le Site.</p>
              <p>Il est recommandé à l&apos;Utilisateur de consulter régulièrement la dernière version des CGU accessible sur le Site. En continuant à utiliser le Site après la publication des modifications, l&apos;Utilisateur est réputé avoir accepté les CGU modifiées.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">11. Droit Applicable et Juridiction Compétente</h2>
              <p>Les présentes CGU sont régies par le droit français.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">12. Contact</h2>
              <p>Pour toute question relative aux présentes CGU, l&apos;Utilisateur peut contacter l&apos;Éditeur à l&apos;adresse e-mail : <a href="mailto:kevmaublanc@gmail.com" className="underline">kevmaublanc@gmail.com</a>.</p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 