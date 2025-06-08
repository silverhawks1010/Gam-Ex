import React from "react";
import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";
import Link from "next/link";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-100 via-white to-neutral-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-2">
        <section className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-800">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-primary">POLITIQUE DE CONFIDENTIALITÉ</h1>
          <div className="text-sm text-neutral-500 mb-8 text-center">Date de dernière mise à jour : <span className="italic">08/06/2025</span></div>
          <div className="space-y-8 text-base leading-relaxed text-neutral-800 dark:text-neutral-200">
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">1. Introduction</h2>
              <p>La présente Politique de Confidentialité a pour objectif d&apos;informer les Utilisateurs du site internet Gam&apos;Ex, accessible à l&apos;adresse <span className="font-semibold">https://www.gam-ex.fr</span> (ci-après le &quot;Site&quot;), de la manière dont leurs données personnelles sont collectées et traitées par Kévin Maublanc, auto-entrepreneur (ci-après le &quot;Responsable du Traitement&quot;).</p>
              <p>Nous accordons une grande importance à la protection de votre vie privée et de vos données personnelles. Cette Politique détaille les types de données que nous collectons, les raisons de cette collecte, la manière dont nous les utilisons, les destinataires de ces données, la durée de leur conservation, ainsi que vos droits concernant vos données personnelles.</p>
              <p>Cette Politique de Confidentialité complète les Mentions Légales et les Conditions Générales d&apos;Utilisation du Site, que vous pouvez consulter à <Link href="/mentions-legales" className="underline">Mentions Légales</Link> et <Link href="/cgu" className="underline">CGU</Link>.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">2. Identité du Responsable du Traitement</h2>
              <p>Le responsable du traitement de vos données personnelles collectées via le Site est :</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Kévin Maublanc</li>
                <li>Numéro SIRET : 93338165900012</li>
                <li>Adresse e-mail : <a href="mailto:kevmaublanc@gmail.com" className="underline">kevmaublanc@gmail.com</a></li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">3. Collecte des Données Personnelles</h2>
              <p>Nous collectons des données personnelles lorsque vous utilisez notre Site, notamment lorsque vous créez un compte utilisateur. Les types de données personnelles que nous collectons sont les suivants :</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Données d&apos;identification : pseudo, adresse e-mail, avatar (si vous en ajoutez un).</li>
                <li>Données de connexion : mot de passe (stocké de manière hachée et sécurisée).</li>
                <li>Données relatives à votre utilisation du service : informations liées à la gestion de votre librairie en ligne (livres ajoutés, lus, etc.).</li>
              </ul>
              <p>Nous nous engageons à ne collecter que les données strictement nécessaires à la réalisation des finalités définies à l&apos;article 4.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">4. Finalités du Traitement des Données</h2>
              <p>Les données personnelles que nous collectons sont utilisées pour les finalités suivantes :</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Gestion de votre compte utilisateur : Création, accès et gestion de votre espace personnel sur le Site.</li>
                <li>Fourniture et gestion du service de gestion de librairie en ligne : Permettre l&apos;ajout, l&apos;organisation et le suivi de votre collection de livres.</li>
                <li>Communication avec l&apos;Utilisateur : Répondre à vos demandes via l&apos;adresse e-mail de contact.</li>
                <li>Sécurité du Site : Assurer la sécurité et le bon fonctionnement du Site, prévenir la fraude et les utilisations abusives.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">5. Base Légale du Traitement</h2>
              <p>Le traitement de vos données personnelles est basé sur les fondements juridiques suivants, conformément au RGPD :</p>
              <ul className="list-disc ml-6 mt-2">
                <li>L&apos;exécution du contrat : Le traitement est nécessaire à l&apos;exécution des Conditions Générales d&apos;Utilisation que vous avez acceptées en créant un compte et en utilisant le Site. Cela inclut la gestion de votre compte et la fourniture du service de gestion de librairie.</li>
                <li>Votre consentement : Pour certaines opérations (par exemple, l&apos;ajout d&apos;un avatar, si cela est facultatif), votre consentement spécifique est recueilli. Vous avez le droit de retirer ce consentement à tout moment.</li>
                <li>Notre intérêt légitime : Pour assurer la sécurité du Site et prévenir les activités frauduleuses.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">6. Destinataires des Données Personnelles</h2>
              <p>Vos données personnelles sont destinées à être utilisées par Kévin Maublanc en tant que Responsable du Traitement.</p>
              <p>Nous pouvons partager vos données avec notre hébergeur, Supabase, qui agit en tant que sous-traitant et traite les données pour notre compte et selon nos instructions. Nous nous assurons que nos sous-traitants présentent des garanties suffisantes quant à la mise en œuvre de mesures techniques et organisationnelles appropriées pour que le traitement réponde aux exigences du RGPD et garantisse la protection de vos droits.</p>
              <p>Vos données personnelles ne sont en aucun cas cédées, louées ou échangées à des tiers à des fins commerciales.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">7. Transfert de Données Hors de l&apos;Union Européenne</h2>
              <p>Dans le cas où vos données seraient transférées vers un pays situé hors de l&apos;Union Européenne, nous nous engageons à mettre en place les garanties appropriées conformément au RGPD (par exemple, clauses contractuelles types de la Commission Européenne) afin d&apos;assurer un niveau de protection suffisant de vos données personnelles.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">8. Durée de Conservation des Données</h2>
              <p>Vos données personnelles sont conservées pour la durée strictement nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées, conformément au RGPD.</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Les données relatives à votre compte utilisateur (pseudo, email, avatar, données de gestion de librairie) sont conservées tant que votre compte est actif.</li>
                <li>En cas de suppression de votre compte, vos données seront supprimées ou anonymisées dans un délai raisonnable, sauf obligation légale de les conserver pour une durée plus longue (par exemple, à des fins probatoires).</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">9. Sécurité des Données</h2>
              <p>Nous mettons en œuvre les mesures techniques et organisationnelles appropriées afin de garantir un niveau de sécurité adapté au risque, en vue de protéger vos données personnelles contre toute destruction, perte, altération, divulgation ou accès non autorisé.</p>
              <p>Ces mesures comprennent notamment :</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Le hachage des mots de passe.</li>
                <li>L&apos;utilisation d&apos;une connexion sécurisée (HTTPS) pour l&apos;accès au Site.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">10. Vos Droits Concernant Vos Données Personnelles</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Droit d&apos;accès : Vous avez le droit d&apos;obtenir la confirmation que vos données sont traitées et d&apos;obtenir une copie de ces données.</li>
                <li>Droit de rectification : Vous avez le droit de demander la correction des données inexactes vous concernant et de compléter les données incomplètes.</li>
                <li>Droit à l&apos;effacement (&quot;droit à l&apos;oubli&quot;) : Vous avez le droit de demander la suppression de vos données dans certains cas (par exemple, si les données ne sont plus nécessaires au regard des finalités pour lesquelles elles ont été collectées).</li>
                <li>Droit à la limitation du traitement : Vous avez le droit de demander la limitation du traitement de vos données dans certains cas (par exemple, si vous contestez l&apos;exactitude des données).</li>
                <li>Droit d&apos;opposition au traitement : Vous avez le droit de vous opposer au traitement de vos données dans certains cas (par exemple, à des fins de prospection commerciale).</li>
                <li>Droit à la portabilité des données : Vous avez le droit de recevoir les données que vous nous avez fournies dans un format structuré, couramment utilisé et lisible par machine, et de transmettre ces données à un autre responsable du traitement lorsque cela est techniquement possible.</li>
                <li>Droit de retirer votre consentement : Lorsque le traitement est basé sur votre consentement, vous avez le droit de retirer ce consentement à tout moment.</li>
                <li>Droit de définir des directives post-mortem : Vous avez le droit de définir des directives relatives à la conservation, à l&apos;effacement et à la communication de vos données personnelles après votre décès.</li>
                <li>Droit d&apos;introduire une réclamation auprès d&apos;une autorité de contrôle : Vous avez le droit d&apos;introduire une réclamation auprès de la CNIL (Commission Nationale de l&apos;Informatique et des Libertés) si vous estimez que le traitement de vos données personnelles n&apos;est pas conforme au RGPD. Les coordonnées de la CNIL sont les suivantes : 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07 - Tél : 01 53 73 22 22.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">11. Exercice de Vos Droits</h2>
              <p>Pour exercer vos droits ou pour toute question concernant le traitement de vos données personnelles, vous pouvez nous contacter :</p>
              <p>Par e-mail à l&apos;adresse : <a href="mailto:kevmaublanc@gmail.com" className="underline">kevmaublanc@gmail.com</a></p>
              <p>Pour que votre demande soit traitée efficacement, veuillez nous fournir les informations nécessaires pour vous identifier (nom, prénom, adresse e-mail utilisée pour le compte utilisateur) et préciser clairement le droit que vous souhaitez exercer. Nous pourrons vous demander des informations supplémentaires pour confirmer votre identité si nécessaire.</p>
              <p>Nous nous engageons à vous répondre dans les meilleurs délais et au plus tard dans un délai d&apos;un mois à compter de la réception de votre demande. Ce délai peut être prolongé de deux mois compte tenu de la complexité et du nombre de demandes.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">12. Cookies</h2>
              <p>Le Site utilise des cookies. Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone, etc.) lors de votre visite sur le Site.</p>
              <p>Nous utilisons des cookies d&apos;authentification. Ces cookies sont strictement nécessaires au fonctionnement du Site et vous permettent de vous connecter à votre compte utilisateur et d&apos;accéder aux fonctionnalités réservées aux membres. Ils sont exemptés de l&apos;obligation de recueillir un consentement préalable.</p>
              <p>Vous pouvez gérer vos préférences en matière de cookies via les paramètres de votre navigateur internet. La plupart des navigateurs vous permettent de refuser ou de supprimer les cookies. Cependant, le refus des cookies d&apos;authentification vous empêchera d&apos;accéder à votre compte et d&apos;utiliser les fonctionnalités nécessitant une connexion.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-2 text-primary">13. Modification de la Politique de Confidentialité</h2>
              <p>Nous nous réservons le droit de modifier la présente Politique de Confidentialité à tout moment afin de prendre en compte les évolutions légales, réglementaires, techniques ou les modifications apportées au Site.</p>
              <p>La date de dernière mise à jour sera indiquée en haut de la Politique. Nous vous encourageons à consulter régulièrement cette page pour prendre connaissance des éventuelles modifications. En continuant à utiliser le Site après la publication des modifications, vous acceptez la Politique de Confidentialité révisée.</p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 