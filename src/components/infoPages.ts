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
          { text: "Support contact:", email: "mira.support@gmail.com" },
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
          { text: "Accessibility Contact Person:", email: "mira.accessibility@gmail.com" },
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
    title: "Accessibility at Mira",
    intro:
      "At Mira, accessibility is not an afterthought. It is part of how the product is designed, built, tested, and improved. We want Mira to be useful for people with different needs, devices, abilities, and ways of interacting with digital services.",
    sections: [
      {
        title: "Our goal",
        body: [
          "Our goal is simple: users should be able to discover services, understand information, complete bookings, and manage their experience with as little friction as possible.",
        ],
      },
      {
        title: "Accessibility built into the product",
        body: [
          "Mira is designed to support different ways of using the platform. Users should be able to navigate with a keyboard, screen reader, pointer device, or touch input. Important controls are designed to have clear names, visible focus states, predictable navigation order, and meaningful error messages.",
          "This helps users understand where they are, what they can do next, and how to recover if something goes wrong. Accessibility is treated as part of product quality, not as a separate layer added after the interface is finished.",
        ],
      },
      {
        title: "Clear and understandable content",
        body: [
          "Good accessibility is not only about technical support. It is also about making information easier to understand.",
          "Mira aims to use clear, direct, and practical language across the product. Service descriptions, actions, forms, and messages should be written in a way that helps users make decisions confidently.",
          "Where suitable, Mira supports easy-language alternatives. This gives users the option to switch to simpler descriptions when they prefer clearer wording or need additional support to understand content.",
        ],
      },
      {
        title: "Flexible interaction for different users",
        body: [
          "People use digital products in different ways. Some users rely on a keyboard. Some use assistive technologies such as screen readers. Others use touch input, a mouse, or a combination of several methods.",
          "Mira is designed with this flexibility in mind. Interactive elements should be reachable, understandable, and usable across different input methods. This makes the platform more reliable not only for users with disabilities, but also for anyone using Mira in different environments or on different devices.",
        ],
      },
      {
        title: "Reduced motion for a calmer experience",
        body: [
          "Motion can make an interface feel dynamic, but it should never be required to understand or use a product.",
          "Mira supports reduced-motion preferences for users who prefer a calmer experience or who may be sensitive to animation. When reduced motion is enabled, unnecessary movement and animation are limited, while the product remains fully usable.",
        ],
      },
      {
        title: "Accessibility settings where users can find them",
        body: [
          "One of Mira's key accessibility features is direct access to accessibility settings from the navigation bar.",
          "Instead of hiding important preferences deep inside a separate settings page, Mira makes them available from the main interface. This gives users faster access to options that can make the product easier and more comfortable to use.",
          "This approach reflects our belief that accessibility should be visible, practical, and easy to control.",
        ],
      },
      {
        title: "AI-supported alternative text for service images",
        body: [
          "Services on Mira often include visual content. To make this content more accessible, Mira uses a vision-language model to generate alternative text descriptions for service images.",
          "These descriptions help users who cannot directly view or interpret images understand what is shown. This makes service content more inclusive and gives users more context when comparing options or making a booking decision.",
          "AI-generated descriptions support accessibility at scale, especially when many services contain images. They are part of Mira's broader effort to make visual information available to more users.",
        ],
      },
      {
        title: "Accessibility tested across key flows",
        body: [
          "Accessibility is also included in Mira's testing process. Automated tests cover accessibility behavior in many important parts of the platform, including dialogs, forms, menus, filters, and booking flows.",
          "These tests help us identify issues earlier and keep accessibility more consistent as the product grows. By testing accessibility as part of development, Mira reduces the risk of important features becoming harder to use after updates.",
        ],
      },
      {
        title: "Continuous improvement",
        body: [
          "Accessibility is an ongoing process. Mira is designed to improve over time as we learn from users, test new features, and refine existing interactions.",
          "We know that accessibility needs can be different from person to person. Feedback helps us understand real barriers and make practical improvements that matter.",
        ],
      },
      {
        title: "Accessibility contact",
        body: [
          { text: "Accessibility Contact Person:", email: "mira.accessibility@gmail.com" },
          "If something blocks you, feels confusing, or does not work well with your assistive technology, please contact the accessibility contact person.",
          "When reporting an issue, please include the page, the action you were trying to complete, and the device or assistive technology you were using. This helps us understand the problem and improve Mira more effectively.",
          "We appreciate feedback that helps make Mira more accessible, reliable, and comfortable for everyone.",
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
