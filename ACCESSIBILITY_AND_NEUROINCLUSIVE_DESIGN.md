# HCIL Accessibility & Neuroinclusive Design Standard

**Principle:** Inclusive by design. Accessible by default. Personalized by choice.

This standard applies to the public website and, as those areas are redesigned, the Talent Portal, HCIL Academy, assessments, dashboards, and AI-assisted workflows. Accessibility is a product quality requirement, not a decorative widget or a final compliance patch.

## 1. Design commitments

- Do not require a diagnosis or disability disclosure to access an accommodation.
- Preserve the brand identity while offering comfortable reading, display, and motion choices.
- Prefer plain language, explicit labels, short paragraphs, meaningful headings, and concrete instructions.
- Use consistent navigation, predictable interaction patterns, and visible progress for multi-step tasks.
- Avoid surprise motion, flashing, auto-advancing content, unexpected pop-ups, and time pressure unless essential.
- Give users control over media playback, animation, text presentation, and information density.
- Never assume that all people with the same disability or neurotype have the same preferences.

## 2. Baseline standard

Target WCAG 2.2 Level AA for all public-facing experiences. Include keyboard-only, screen-reader, zoom/reflow, contrast, reduced-motion, and touch-target checks in release acceptance. Automated checks supplement but do not replace manual testing with assistive technology and people with lived experience.

## 3. Reading and cognitive accessibility

- Use clear sans-serif typography, comfortable line lengths, left alignment for left-to-right prose, and adequate line/paragraph spacing.
- Avoid long unbroken paragraphs, unexplained acronyms, idioms where literal language is clearer, and jargon-first explanations.
- Provide descriptive headings, informative link text, explicit form labels, useful error messages, and clear next steps.
- Keep navigation and controls in consistent locations; avoid changing context without warning.
- Offer alternatives to timed or speed-based assessment where speed is not the competency being measured.
- Allow users to save progress and resume longer tasks where feasible.

## 4. Sensory and motion accessibility

- Respect `prefers-reduced-motion` and provide an in-product reduced-motion option.
- Do not autoplay audio. Avoid auto-advancing carousels; where movement is necessary, provide pause/stop controls.
- Avoid flashing content and excessive parallax, pulsing, or decorative animation.
- Ensure media has captions, transcripts, or audio descriptions as appropriate.
- Provide clear contrast and do not communicate status through color alone.

## 5. Personalization controls

The public-site preference panel is an initial presentation layer. It offers text scaling, reading spacing, an alternate system sans-serif stack, high-contrast presentation, and reduced motion. Preferences are stored locally on the visitor's device, are optional, and do not imply a diagnosis. These controls do not by themselves establish WCAG conformance or guarantee a dyslexia-specific typeface.

## 6. Product-specific acceptance

### Public website
- Clear page hierarchy and concise, benefit-led copy.
- Keyboard-operable navigation and visible focus.
- Accessible hero imagery and manually controlled slides.
- No autoplay; no text embedded only in images.
- English and French accessibility labels and content.

### Talent Portal
- Accessible sign-in, profile, application, and task flows.
- Form labels, field instructions, error summaries, and status announcements.
- Clear progress and save/resume where workflows are multi-step.
- No inaccessible drag-only interaction or color-only status.

### HCIL Academy and assessments
- Offer content in more than one format where practical (text, audio, captions, visual explanation).
- Do not equate reading speed, typing speed, eye contact, or one communication style with competence unless it is genuinely job-relevant.
- Provide clear assessment instructions, predictable structure, and reasonable alternatives where the learning outcome permits.

### AI-assisted experiences
- Use plain-language explanations and let users request simpler or more detailed wording.
- Avoid treating disability, neurotype, accent, language proficiency, or communication style as a proxy for capability.
- Keep meaningful human review for consequential evaluation and provide a way to question or correct outputs.

## 7. Release checklist

- [ ] Keyboard-only operation; no keyboard traps.
- [ ] Visible focus on all interactive elements.
- [ ] Correct landmarks, heading order, names, roles, and states.
- [ ] Text and interface contrast checked; color is not the only signal.
- [ ] Text can be enlarged and content reflows without loss or horizontal scrolling at common zoom levels.
- [ ] Reduced-motion preference is respected; no forced autoplay.
- [ ] Forms have persistent labels, understandable errors, and announced status changes.
- [ ] Images have appropriate alternative text; decorative images are ignored by assistive technology.
- [ ] English and French controls, instructions, and accessibility labels are reviewed.
- [ ] Tested with at least one screen reader and keyboard-only navigation.
- [ ] Usability feedback sought from people with varied access needs before claiming inclusive or accessible outcomes.

## 8. Honest claims

Do not claim that a font, toolbar, overlay, or automated scan makes HCIL "dyslexia-friendly", "autism-friendly", or fully accessible. Describe specific supported options and tested outcomes. Accessibility claims must be tied to evidence and scope.
