"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { faqs } from "@/lib/content";
import Reveal from "./Reveal";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="section section--tight" aria-labelledby="faq-title">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="label">Questions, answered.</p>
            <h2 className="section-title" id="faq-title">
              The things people usually ask us.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="body-lg">
              Still wondering about something? Send us a message and we&apos;ll
              give you a straight answer.
            </p>
          </Reveal>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                className={`faq-item${isOpen ? " is-open" : ""}`}
                key={faq.question}
              >
                <h3>
                  <button
                    type="button"
                    className="faq-question"
                    id={`faq-question-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    {faq.question}
                    <Plus className="faq-icon" size={22} strokeWidth={1.4} aria-hidden="true" />
                  </button>
                </h3>
                <div
                  className="faq-panel"
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                >
                  <div className="faq-panel-inner">
                    <p className="faq-answer">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
