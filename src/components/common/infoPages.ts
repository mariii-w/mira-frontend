type InfoSection = {
  title: string;
  body: (string | { text: string; email: string })[];
};

export type InfoPageContent = {
  title: string;
  intro: string;
  sections: InfoSection[];
};

export const INFO_PAGES = {
  about: {
    title: "About Mira",
    intro:
      "Mira is a local service marketplace that helps people find trusted support nearby and helps service providers present their work clearly.",
    sections: [
      {
        title: "What Mira is for",
        body: [
          "Mira connects people who need everyday help with local providers who offer practical services: home help, tutoring, technology support, repairs, care-related assistance, and other neighbourhood services.",
          "The platform is designed to make service discovery feel less anonymous. Services show what is offered, who offers it, where the service is available, what it costs, and which trust signals are available before a user decides to book.",
        ],
      },
      {
        title: "Why trust matters",
        body: [
          "Local services often involve personal spaces, individual needs, and direct communication between people. That means trust cannot be an afterthought.",
          "Mira supports trust through clear provider information, service details, visible availability, credential summaries where available, and booking flows that help users understand what they are requesting.",
        ],
      },
      {
        title: "How Mira should feel",
        body: [
          "The interface should be calm, predictable, and easy to scan. Users should not have to fight the product to understand the next step.",
          "We keep service details, provider information, prices, accessibility-related settings, and booking actions close to where users need them. The goal is a product that feels practical, respectful, and easy to return to.",
        ],
      },
      {
        title: "Who Mira supports",
        body: [
          "Mira is built for people looking for help, people offering services, and people who need digital products to be understandable and flexible.",
          "That includes users who prefer clear wording, reduced motion, keyboard navigation, assistive technology, or simply a quieter product experience with fewer hidden decisions.",
        ],
      },
    ],
  },
  contact: {
    title: "Contact Us",
    intro:
      "Questions, feedback, and reports help us understand what works well and what needs to improve.",
    sections: [
      {
        title: "What you can contact us about",
        body: [
          "You can contact the Mira team about the project, accounts, services, bookings, credential information, confusing flows, or feedback about the experience.",
          { text: "Support contact:", email: "support@mira.com" },
          "If something on Mira feels unclear, incomplete, or difficult to use, a short description of what happened is already helpful.",
        ],
      },
      {
        title: "Helpful details to include",
        body: [
          "When reporting a problem, include the page you were using, the action you were trying to complete, what you expected to happen, and what actually happened.",
          "If the issue is connected to a service, booking, profile, credential, or image, include the relevant title or context so the team can find it faster.",
        ],
      },
      {
        title: "Accessibility issues",
        body: [
          "If your message is about an accessibility barrier, please contact the accessibility contact directly.",
          "Useful details include the page, the action you were trying to complete, the device or browser you used, and any assistive technology involved.",
          {
            text: "Accessibility Contact Person:",
            email: "accessibility@mira.com",
          },
        ],
      },
      {
        title: "How we use feedback",
        body: [
          "Feedback helps us prioritize fixes, improve wording, refine flows, and make Mira more reliable for different users.",
          "We may not be able to solve every request immediately, but reports help us understand real use cases instead of guessing from inside the product team.",
        ],
      },
    ],
  },
  accessibility: {
    title: "Accessibility Statement for Mira",
    intro:
      "Mira is designed to be accessible and usable for as many people as possible. Accessibility is considered throughout the development process and is not treated only as a final addition. This statement describes the current accessibility status of Mira, the accessibility features that have already been implemented, known limitations, and how users can contact us if they experience barriers.",
    sections: [
      {
        title: "Current accessibility status",
        body: [
          "Mira currently supports several accessibility features that are intended to make the platform easier to use with different devices, input methods, and assistive technologies. Important parts of the platform, such as forms, dialogs, menus, filters, profile pages, listing pages, and booking-related flows, are designed with clear labels, understandable error messages, keyboard accessibility, predictable focus handling, and screen reader support.",
          "The platform also supports different ways of interaction, including keyboard navigation, screen readers, pointer devices, and touch input. Accessibility tests are used for important user flows to help detect and prevent barriers during development.",
        ],
      },
      {
        title: "Accessibility panel",
        body: [
          "Mira provides an accessibility panel in the navigation bar. This panel allows users to activate accessibility-related settings directly from the main interface. The purpose of this design is to make accessibility options easy to find without requiring users to search through a separate settings page.",
        ],
      },
      {
        title: "Easy Language",
        body: [
          "Some service descriptions and user biographies can be displayed in Easy Language. This feature helps users understand content more easily by presenting information in simpler wording. The feature is intended to reduce cognitive barriers and make service information more accessible.",
        ],
      },
      {
        title: "Reduced Motion",
        body: [
          "Mira includes a Reduced Motion setting. Users can activate this option if animations or moving interface elements are distracting, uncomfortable, or difficult to use. When Reduced Motion is enabled, unnecessary animations are reduced while the platform remains fully usable.",
        ],
      },
      {
        title: "Image descriptions",
        body: [
          "Service images can receive AI-supported alternative text descriptions. These descriptions help screen reader users understand the content and purpose of images. This makes visual service content more accessible for users who cannot see the image or cannot easily interpret it visually.",
        ],
      },
      {
        title: "Known accessibility limitations",
        body: [
          "Mira is still under development, and not all accessibility features may be complete in every part of the platform. Some AI-supported image descriptions may not always be fully accurate and may require further improvement. Some service descriptions or user-generated content may not yet be available in Easy Language. In addition, individual interface areas may still need further testing with assistive technologies, different browsers, and different devices.",
          "We are aware that accessibility is an ongoing process. Known issues will be reviewed and improved as the project continues.",
        ],
      },
      {
        title: "Feedback and contact",
        body: [
          "If you experience an accessibility barrier while using Mira, or if something is hard to understand, difficult to operate, or does not work well with your assistive technology, please contact us.",
          {
            text: "Accessibility contact:",
            email: "accessibility@mira.com",
          },
          "To help us understand and fix the issue, please include the page where the problem occurred, what you were trying to do, your device or browser, and the assistive technology you used, if applicable.",
        ],
      },
      {
        title: "Update date",
        body: [
          "This accessibility statement was last updated on 26 June 2026.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    intro:
      "These terms describe the expected use of Mira. They are written for this project version of the product and should be reviewed before any real public launch.",
    sections: [
      {
        title: "Using Mira",
        body: [
          "Mira is designed to help users discover, offer, and request local services. Users should use the platform honestly and respectfully.",
          "Information added to Mira should be accurate enough for other users to understand the service, provider, price, location, availability, and relevant qualifications.",
        ],
      },
      {
        title: "Services and profiles",
        body: [
          "Providers are responsible for keeping their services clear and up to date. A service should describe real support and should not mislead customers about what is offered.",
          "Profile information, service descriptions, images, credentials, and availability should not be used to impersonate another person, advertise unrelated content, or create unsafe expectations.",
        ],
      },
      {
        title: "Bookings and communication",
        body: [
          "Mira supports service discovery and booking requests, but users remain responsible for their own communication, agreements, and conduct when arranging services.",
          "Users should treat each other respectfully, respond honestly, and avoid sharing unnecessary sensitive information in messages, services, or booking details.",
        ],
      },
      {
        title: "Trust and safety",
        body: [
          "Verification badges and credential information are shown only when the application has public verification data for a profile.",
          "Users should not submit false credentials, manipulated evidence, misleading service images, or information that could create a false sense of trust.",
          "If content appears incorrect, unsafe, discriminatory, inaccessible, or otherwise harmful, users should report it so the team can review the issue.",
        ],
      },
      {
        title: "Changes and availability",
        body: [
          "Mira may change as the project develops. Features, routes, wording, and data shown in the product can be updated as the team improves the experience.",
          "Because this is a project version, these terms are informational and not a substitute for final legal terms for a production service.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "Mira should collect, use, and display only the information needed to make local service discovery, trust, and booking understandable.",
    sections: [
      {
        title: "Information users provide",
        body: [
          "Users may provide account information, profile details, services, descriptions, prices, locations, availability, uploaded images, credential submissions, and booking information.",
          "Providers may also submit credential evidence for verification. This evidence is treated differently from public profile information and should not be shown on public pages.",
        ],
      },
      {
        title: "Information shown publicly",
        body: [
          "Public service pages can show service details, price, location area, provider name, public profile information, service images, tags, and public verified credential summaries.",
          "Credential badges and verified credential summaries can be shown publicly when the backend marks them as publicly visible and verified.",
        ],
      },
      {
        title: "Information kept private",
        body: [
          "Private credential evidence, hidden credentials, account-only information, authentication data, and administrative review details should not be exposed on public pages.",
          "Access to private user or credential information should be limited to the account owner or authorized roles that need it for the product to work.",
        ],
      },
      {
        title: "Accessibility and media information",
        body: [
          "Mira may store accessibility preferences such as easy-language and reduced-motion choices so the interface can respect the user's needs.",
          "Service images can receive generated alternative text descriptions so the same content is easier to understand with assistive technology. These descriptions are connected to the service media they describe.",
        ],
      },
      {
        title: "How information is used",
        body: [
          "Information in Mira is used to display services, support search and filtering, process booking flows, show provider context, support credential verification, and improve accessibility.",
          "The product should avoid exposing more personal information than users need to make a decision or complete a service interaction.",
        ],
      },
    ],
  },
} satisfies Record<string, InfoPageContent>;
