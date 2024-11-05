import express from "express";

const router = express.Router();

const languages = {
  hr: {
    home: "/",
    properties: "/nekretnine",
    villas: "/nekretnine/vile",
    apartments: "/nekretnine/stanovi",
    lands: "/nekretnine/zemljista",
    commercial: "/nekretnine/poslovni-prostori",
    about: "/o-nama",
    contact: "/kontakt",
  },
  en: {
    home: "/",
    properties: "/properties",
    villas: "/villas",
    apartments: "/apartments",
    lands: "/lands",
    commercial: "/commercial-spaces",
    about: "/about-us",
    contact: "/contact",
  },
  de: {
    home: "/",
    properties: "/immobilien",
    villas: "/villen",
    apartments: "/wohnungen",
    lands: "/grundstücke",
    commercial: "/gewerbeflächen",
    about: "/über-uns",
    contact: "/kontakt",
  },
  it: {
    home: "/",
    properties: "/immobili",
    villas: "/ville",
    apartments: "/appartamenti",
    lands: "/terreni",
    commercial: "/spazi-commerciali",
    about: "/chi-siamo",
    contact: "/contatto",
  },
};

const setupRoutes = (lang) => {
  router.get(`/${lang}`, (req, res) => {
    res.send(`Home page in ${lang}`);
  });

  Object.entries(languages[lang]).forEach(([key, path]) => {
    router.get(`/${lang}${path}`, (req, res) => {
      res.send(`${key.charAt(0).toUpperCase() + key.slice(1)} page in ${lang}`);
    });
  });
};

Object.keys(languages).forEach((lang) => {
  setupRoutes(lang);
});

router.use((req, res) => {
  res.status(404).send("Page not found");
});

export default router;
