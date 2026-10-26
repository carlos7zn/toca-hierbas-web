# Public site redesign

The public pages share a restrained, Apple-inspired visual system: mineral white,
soft black, green accents, system typography, generous spacing and quiet motion.
Dark mode, keyboard navigation, reduced-motion preferences and mobile layouts are
supported. The existing community, Discord authentication, API and database are
outside this change.

The homepage features the actual Discord presence count and a playable leaf game.
The arcade now has search, isolated game controllers, a repaired memory round and
one trivia controller. Shared navigation replaces inconsistent headers and nested
footers. The unused legacy administration screen points to the working community.

## Validation

- Production build and all three existing authentication tests pass.
- JavaScript syntax, CSS parsing, local asset references, duplicate HTML IDs and
  document structure were checked.
- Browser review covered desktop and 390px mobile layouts, light/dark theme,
  mobile menu, keyboard dismissal and FAQ interaction. Public informational pages
  were checked for horizontal overflow.
- The browser became unavailable when the session resumed. Final arcade interaction
  checks and a fresh screenshot after the last spacing adjustments remain unverified.
- Granny and Moto retain external game providers; their availability is independent
  of this site's shared interface.
