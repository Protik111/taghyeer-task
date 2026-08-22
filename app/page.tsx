import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionLabel from "@/components/ui/SectionLabel";
import Tag from "@/components/ui/Tag";
import DecorativeRings from "@/components/ui/DecorativeRings";
import HeroChatDemo from "@/components/marketing/HeroChatDemo";

const FEATURES = [
  {
    title: "Real-time delivery",
    description:
      "Messages arrive over a live Socket.IO connection the instant they're sent — no polling, no refresh.",
  },
  {
    title: "1:1 and group chats",
    description:
      "Start a direct conversation with anyone, or spin up a group with admins, add/remove members, and rename it on the fly.",
  },
  {
    title: "Find people instantly",
    description: "Search by name or phone number and jump straight into a conversation.",
  },
  {
    title: "Built for the real thing",
    description:
      "Loading, empty, and error states throughout; scroll position that behaves; messages that retry when a send fails.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Sign in with your phone",
    description: "No password, no separate sign-up — a new number is registered automatically.",
  },
  {
    step: "02",
    title: "Find someone, or start a group",
    description: "Search by name or number, or gather a few people into a named group.",
  },
  {
    step: "03",
    title: "Chat in real time",
    description: "Messages land instantly on both ends, exactly as you'd expect.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden pt-16 sm:pt-20">
        <DecorativeRings className="-right-30 -top-20 h-105 w-105" />
        <Container className="relative flex flex-col items-center gap-14 pb-20 lg:flex-row lg:items-center lg:gap-10 lg:pb-28">
          <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <SectionLabel>Real-time chat, done simply</SectionLabel>
            <h1 className="max-w-xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-hero">
              Conversations that show up{" "}
              <span className="text-magenta-light">the moment they happen.</span>
            </h1>
            <p className="max-w-md text-lead text-pale-blue">
              Loopin is a 1-to-1 and group messaging app built around one core screen: a chat
              panel that sends, receives, and scrolls the way people actually expect it to.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Button href="/login" variant="solid">
                Get started
              </Button>
              <Button href="#how-it-works" variant="outline">
                See how it works
              </Button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center">
            <Tag
              tone="navyCyan"
              rotate={-8}
              className="absolute -left-6 -top-8 hidden text-sm sm:block"
            >
              Real-time
            </Tag>
            <Tag
              tone="pink"
              rotate={6}
              className="absolute -right-4 top-16 hidden text-sm sm:block"
            >
              1:1 &amp; groups
            </Tag>
            <Tag
              tone="plumWhite"
              rotate={-4}
              className="absolute -bottom-2 left-8 hidden text-sm sm:block"
            >
              JWT secured
            </Tag>
            <HeroChatDemo />
          </div>
        </Container>
      </section>

      <section id="features" className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            label="What it does"
            title="Everything a chat screen needs, nothing it doesn't"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-3 rounded-card border border-border bg-card p-6"
              >
                <h3 className="text-card-title font-semibold text-white">{f.title}</h3>
                <p className="text-default text-pale-blue">{f.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="py-20 sm:py-24">
        <Container>
          <SectionHeading label="Getting in" title="Three steps to your first conversation" />
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="flex flex-col gap-3">
                <span className="text-subheading font-bold text-magenta-light">{s.step}</span>
                <h3 className="text-card-title font-semibold text-white">{s.title}</h3>
                <p className="text-default text-pale-blue">{s.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="flex flex-col items-center gap-6 rounded-card border border-border bg-card px-6 py-16 text-center">
          <h2 className="max-w-xl text-3xl font-bold text-white sm:text-4xl">
            Try it — sign in and start a conversation
          </h2>
          <p className="max-w-md text-default text-pale-blue">
            All you need is a phone number and a name.
          </p>
          <Button href="/login" variant="solid">
            Get started
          </Button>
        </Container>
      </section>
    </>
  );
}
