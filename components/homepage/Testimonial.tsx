import Image from "next/image";

export function Testimonial() {
  return (
    <section className="bg-surface py-20 px-6">
      <div className="max-w-[680px] mx-auto text-center">
        {/* Quotation mark */}
        <div className="text-[72px] font-serif leading-none mb-2 select-none text-accent">
          &ldquo;
        </div>

        {/* Quote */}
        <blockquote className="text-[20px] font-medium text-text-primary leading-relaxed mb-8">
          I used to spend my evenings copy-pasting resumes. Now I open my
          dashboard to see interviews waiting. It feels like cheating. Had 3
          offers on the table simultaneously.
        </blockquote>

        {/* Author */}
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/public/images/user-icon.png"
            alt="Alex Chen"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <div className="text-left">
            <p className="text-[14px] font-semibold text-text-primary">
              Alex Chen
            </p>
            <p className="text-[12px] text-text-muted">
              Senior Software Engineer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
