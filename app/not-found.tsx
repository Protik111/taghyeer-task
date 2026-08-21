import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import LogoMark from "@/components/ui/LogoMark";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <LogoMark size={40} />
      <p className="text-meta font-semibold uppercase tracking-[0.16em] text-plum">
        404
      </p>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        Page not found
      </h1>
      <p className="max-w-md text-default text-pale-blue">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have been
        moved. Let&rsquo;s get you back on track.
      </p>
      <Button href="/" arrow="outline">
        Back to Homepage
      </Button>
    </Container>
  );
}
