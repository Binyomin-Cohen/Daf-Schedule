/**
 * Captured responses from the Shas.org Daf Yomi and PDF APIs.
 * The masechta list does not change, so the schedule is built from this
 * file and keeps working with no network connection.
 * A live request is used only to learn the current Daf Yomi cycle.
 *
 * Daf Yomi counts Me'ilah, Kinim, Tamid, and Middos as one masechta.
 * The PDF API lists those four keys as aliases of that same volume.
 */

export type DafYomiResponse = {
  current_daf: { masechta: string; key: string; daf: number };
  cycle: { number: number; label: string };
  next_masechta: { name: string; key: string; starts: string };
  date: string;
};

export type DafYomiMasechta = {
  first: DafYomiResponse;
  last: DafYomiResponse;
};

export type PdfAmudSuccess = {
  success: true;
  masechta: string;
  daf: number;
  amud: "a" | "b";
  page_number: number;
  pdf_url: string;
  file_size: number;
};

export type PdfAmudMissing = {
  error: string;
  message: string;
  last_daf: number;
  last_amud: "a" | "b";
};

export type PdfAmudResponse = PdfAmudSuccess | PdfAmudMissing;

export type PdfMasechtaList = {
  error: string;
  message: string;
  available_masechtot: string[];
};

export const DAF_YOMI_MASECHTOS: DafYomiMasechta[] = [
  {
    "first": {
      "current_daf": {
        "masechta": "Berachos",
        "key": "berachos",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Shabbos",
        "key": "shabbos",
        "starts": "2020-03-08"
      },
      "date": "2020-01-05"
    },
    "last": {
      "current_daf": {
        "masechta": "Berachos",
        "key": "berachos",
        "daf": 64
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Shabbos",
        "key": "shabbos",
        "starts": "2020-03-08"
      },
      "date": "2020-03-07"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Shabbos",
        "key": "shabbos",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Eruvin",
        "key": "eruvin",
        "starts": "2020-08-11"
      },
      "date": "2020-03-08"
    },
    "last": {
      "current_daf": {
        "masechta": "Shabbos",
        "key": "shabbos",
        "daf": 157
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Eruvin",
        "key": "eruvin",
        "starts": "2020-08-11"
      },
      "date": "2020-08-10"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Eruvin",
        "key": "eruvin",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Pesachim",
        "key": "pesachim",
        "starts": "2020-11-23"
      },
      "date": "2020-08-11"
    },
    "last": {
      "current_daf": {
        "masechta": "Eruvin",
        "key": "eruvin",
        "daf": 105
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Pesachim",
        "key": "pesachim",
        "starts": "2020-11-23"
      },
      "date": "2020-11-22"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Pesachim",
        "key": "pesachim",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Shekalim",
        "key": "shekalim",
        "starts": "2021-03-23"
      },
      "date": "2020-11-23"
    },
    "last": {
      "current_daf": {
        "masechta": "Pesachim",
        "key": "pesachim",
        "daf": 121
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Shekalim",
        "key": "shekalim",
        "starts": "2021-03-23"
      },
      "date": "2021-03-22"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Shekalim",
        "key": "shekalim",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Yoma",
        "key": "yoma",
        "starts": "2021-04-13"
      },
      "date": "2021-03-23"
    },
    "last": {
      "current_daf": {
        "masechta": "Shekalim",
        "key": "shekalim",
        "daf": 22
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Yoma",
        "key": "yoma",
        "starts": "2021-04-13"
      },
      "date": "2021-04-12"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Yoma",
        "key": "yoma",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Sukkah",
        "key": "sukkah",
        "starts": "2021-07-09"
      },
      "date": "2021-04-13"
    },
    "last": {
      "current_daf": {
        "masechta": "Yoma",
        "key": "yoma",
        "daf": 88
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Sukkah",
        "key": "sukkah",
        "starts": "2021-07-09"
      },
      "date": "2021-07-08"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Sukkah",
        "key": "sukkah",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Beitzah",
        "key": "beitzah",
        "starts": "2021-09-02"
      },
      "date": "2021-07-09"
    },
    "last": {
      "current_daf": {
        "masechta": "Sukkah",
        "key": "sukkah",
        "daf": 56
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Beitzah",
        "key": "beitzah",
        "starts": "2021-09-02"
      },
      "date": "2021-09-01"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Beitzah",
        "key": "beitzah",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Rosh Hashanah",
        "key": "rosh-hashanah",
        "starts": "2021-10-11"
      },
      "date": "2021-09-02"
    },
    "last": {
      "current_daf": {
        "masechta": "Beitzah",
        "key": "beitzah",
        "daf": 40
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Rosh Hashanah",
        "key": "rosh-hashanah",
        "starts": "2021-10-11"
      },
      "date": "2021-10-10"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Rosh Hashanah",
        "key": "rosh-hashanah",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Ta'anis",
        "key": "taanis",
        "starts": "2021-11-14"
      },
      "date": "2021-10-11"
    },
    "last": {
      "current_daf": {
        "masechta": "Rosh Hashanah",
        "key": "rosh-hashanah",
        "daf": 35
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Ta'anis",
        "key": "taanis",
        "starts": "2021-11-14"
      },
      "date": "2021-11-13"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Ta'anis",
        "key": "taanis",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Megillah",
        "key": "megillah",
        "starts": "2021-12-14"
      },
      "date": "2021-11-14"
    },
    "last": {
      "current_daf": {
        "masechta": "Ta'anis",
        "key": "taanis",
        "daf": 31
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Megillah",
        "key": "megillah",
        "starts": "2021-12-14"
      },
      "date": "2021-12-13"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Megillah",
        "key": "megillah",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Moed Katan",
        "key": "moed-katan",
        "starts": "2022-01-14"
      },
      "date": "2021-12-14"
    },
    "last": {
      "current_daf": {
        "masechta": "Megillah",
        "key": "megillah",
        "daf": 32
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Moed Katan",
        "key": "moed-katan",
        "starts": "2022-01-14"
      },
      "date": "2022-01-13"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Moed Katan",
        "key": "moed-katan",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Chagigah",
        "key": "chagigah",
        "starts": "2022-02-11"
      },
      "date": "2022-01-14"
    },
    "last": {
      "current_daf": {
        "masechta": "Moed Katan",
        "key": "moed-katan",
        "daf": 29
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Chagigah",
        "key": "chagigah",
        "starts": "2022-02-11"
      },
      "date": "2022-02-10"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Chagigah",
        "key": "chagigah",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Yevamos",
        "key": "yevamos",
        "starts": "2022-03-09"
      },
      "date": "2022-02-11"
    },
    "last": {
      "current_daf": {
        "masechta": "Chagigah",
        "key": "chagigah",
        "daf": 27
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Yevamos",
        "key": "yevamos",
        "starts": "2022-03-09"
      },
      "date": "2022-03-08"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Yevamos",
        "key": "yevamos",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Kesubos",
        "key": "kesubos",
        "starts": "2022-07-08"
      },
      "date": "2022-03-09"
    },
    "last": {
      "current_daf": {
        "masechta": "Yevamos",
        "key": "yevamos",
        "daf": 122
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Kesubos",
        "key": "kesubos",
        "starts": "2022-07-08"
      },
      "date": "2022-07-07"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Kesubos",
        "key": "kesubos",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Nedarim",
        "key": "nedarim",
        "starts": "2022-10-27"
      },
      "date": "2022-07-08"
    },
    "last": {
      "current_daf": {
        "masechta": "Kesubos",
        "key": "kesubos",
        "daf": 112
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Nedarim",
        "key": "nedarim",
        "starts": "2022-10-27"
      },
      "date": "2022-10-26"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Nedarim",
        "key": "nedarim",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Nazir",
        "key": "nazir",
        "starts": "2023-01-25"
      },
      "date": "2022-10-27"
    },
    "last": {
      "current_daf": {
        "masechta": "Nedarim",
        "key": "nedarim",
        "daf": 91
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Nazir",
        "key": "nazir",
        "starts": "2023-01-25"
      },
      "date": "2023-01-24"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Nazir",
        "key": "nazir",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Sotah",
        "key": "sotah",
        "starts": "2023-03-31"
      },
      "date": "2023-01-25"
    },
    "last": {
      "current_daf": {
        "masechta": "Nazir",
        "key": "nazir",
        "daf": 66
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Sotah",
        "key": "sotah",
        "starts": "2023-03-31"
      },
      "date": "2023-03-30"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Sotah",
        "key": "sotah",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Gittin",
        "key": "gittin",
        "starts": "2023-05-18"
      },
      "date": "2023-03-31"
    },
    "last": {
      "current_daf": {
        "masechta": "Sotah",
        "key": "sotah",
        "daf": 49
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Gittin",
        "key": "gittin",
        "starts": "2023-05-18"
      },
      "date": "2023-05-17"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Gittin",
        "key": "gittin",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Kiddushin",
        "key": "kiddushin",
        "starts": "2023-08-15"
      },
      "date": "2023-05-18"
    },
    "last": {
      "current_daf": {
        "masechta": "Gittin",
        "key": "gittin",
        "daf": 90
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Kiddushin",
        "key": "kiddushin",
        "starts": "2023-08-15"
      },
      "date": "2023-08-14"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Kiddushin",
        "key": "kiddushin",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Bava Kama",
        "key": "bava-kamma",
        "starts": "2023-11-04"
      },
      "date": "2023-08-15"
    },
    "last": {
      "current_daf": {
        "masechta": "Kiddushin",
        "key": "kiddushin",
        "daf": 82
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Bava Kama",
        "key": "bava-kamma",
        "starts": "2023-11-04"
      },
      "date": "2023-11-03"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Bava Kama",
        "key": "bava-kamma",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Bava Metzia",
        "key": "bava-metzia",
        "starts": "2024-03-01"
      },
      "date": "2023-11-04"
    },
    "last": {
      "current_daf": {
        "masechta": "Bava Kama",
        "key": "bava-kamma",
        "daf": 119
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Bava Metzia",
        "key": "bava-metzia",
        "starts": "2024-03-01"
      },
      "date": "2024-02-29"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Bava Metzia",
        "key": "bava-metzia",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Bava Basra",
        "key": "bava-basra",
        "starts": "2024-06-27"
      },
      "date": "2024-03-01"
    },
    "last": {
      "current_daf": {
        "masechta": "Bava Metzia",
        "key": "bava-metzia",
        "daf": 119
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Bava Basra",
        "key": "bava-basra",
        "starts": "2024-06-27"
      },
      "date": "2024-06-26"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Bava Basra",
        "key": "bava-basra",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Sanhedrin",
        "key": "sanhedrin",
        "starts": "2024-12-19"
      },
      "date": "2024-06-27"
    },
    "last": {
      "current_daf": {
        "masechta": "Bava Basra",
        "key": "bava-basra",
        "daf": 176
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Sanhedrin",
        "key": "sanhedrin",
        "starts": "2024-12-19"
      },
      "date": "2024-12-18"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Sanhedrin",
        "key": "sanhedrin",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Makkos",
        "key": "makkos",
        "starts": "2025-04-10"
      },
      "date": "2024-12-19"
    },
    "last": {
      "current_daf": {
        "masechta": "Sanhedrin",
        "key": "sanhedrin",
        "daf": 113
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Makkos",
        "key": "makkos",
        "starts": "2025-04-10"
      },
      "date": "2025-04-09"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Makkos",
        "key": "makkos",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Shevuos",
        "key": "shevuos",
        "starts": "2025-05-03"
      },
      "date": "2025-04-10"
    },
    "last": {
      "current_daf": {
        "masechta": "Makkos",
        "key": "makkos",
        "daf": 24
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Shevuos",
        "key": "shevuos",
        "starts": "2025-05-03"
      },
      "date": "2025-05-02"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Shevuos",
        "key": "shevuos",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Avodah Zarah",
        "key": "avodah-zarah",
        "starts": "2025-06-20"
      },
      "date": "2025-05-03"
    },
    "last": {
      "current_daf": {
        "masechta": "Shevuos",
        "key": "shevuos",
        "daf": 49
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Avodah Zarah",
        "key": "avodah-zarah",
        "starts": "2025-06-20"
      },
      "date": "2025-06-19"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Avodah Zarah",
        "key": "avodah-zarah",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Horayos",
        "key": "horayos",
        "starts": "2025-09-03"
      },
      "date": "2025-06-20"
    },
    "last": {
      "current_daf": {
        "masechta": "Avodah Zarah",
        "key": "avodah-zarah",
        "daf": 76
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Horayos",
        "key": "horayos",
        "starts": "2025-09-03"
      },
      "date": "2025-09-02"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Horayos",
        "key": "horayos",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Zevachim",
        "key": "zevachim",
        "starts": "2025-09-16"
      },
      "date": "2025-09-03"
    },
    "last": {
      "current_daf": {
        "masechta": "Horayos",
        "key": "horayos",
        "daf": 14
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Zevachim",
        "key": "zevachim",
        "starts": "2025-09-16"
      },
      "date": "2025-09-15"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Zevachim",
        "key": "zevachim",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Menachos",
        "key": "menachos",
        "starts": "2026-01-13"
      },
      "date": "2025-09-16"
    },
    "last": {
      "current_daf": {
        "masechta": "Zevachim",
        "key": "zevachim",
        "daf": 120
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Menachos",
        "key": "menachos",
        "starts": "2026-01-13"
      },
      "date": "2026-01-12"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Menachos",
        "key": "menachos",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Chullin",
        "key": "chullin",
        "starts": "2026-05-02"
      },
      "date": "2026-01-13"
    },
    "last": {
      "current_daf": {
        "masechta": "Menachos",
        "key": "menachos",
        "daf": 110
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Chullin",
        "key": "chullin",
        "starts": "2026-05-02"
      },
      "date": "2026-05-01"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Chullin",
        "key": "chullin",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Bechoros",
        "key": "bechoros",
        "starts": "2026-09-20"
      },
      "date": "2026-05-02"
    },
    "last": {
      "current_daf": {
        "masechta": "Chullin",
        "key": "chullin",
        "daf": 142
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Bechoros",
        "key": "bechoros",
        "starts": "2026-09-20"
      },
      "date": "2026-09-19"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Bechoros",
        "key": "bechoros",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Arachin",
        "key": "arachin",
        "starts": "2026-11-19"
      },
      "date": "2026-09-20"
    },
    "last": {
      "current_daf": {
        "masechta": "Bechoros",
        "key": "bechoros",
        "daf": 61
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Arachin",
        "key": "arachin",
        "starts": "2026-11-19"
      },
      "date": "2026-11-18"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Arachin",
        "key": "arachin",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Temurah",
        "key": "temurah",
        "starts": "2026-12-22"
      },
      "date": "2026-11-19"
    },
    "last": {
      "current_daf": {
        "masechta": "Arachin",
        "key": "arachin",
        "daf": 34
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Temurah",
        "key": "temurah",
        "starts": "2026-12-22"
      },
      "date": "2026-12-21"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Temurah",
        "key": "temurah",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Kereisos",
        "key": "kereisos",
        "starts": "2027-01-24"
      },
      "date": "2026-12-22"
    },
    "last": {
      "current_daf": {
        "masechta": "Temurah",
        "key": "temurah",
        "daf": 34
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Kereisos",
        "key": "kereisos",
        "starts": "2027-01-24"
      },
      "date": "2027-01-23"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Kereisos",
        "key": "kereisos",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Me'ilah",
        "key": "meilah",
        "starts": "2027-02-20"
      },
      "date": "2027-01-24"
    },
    "last": {
      "current_daf": {
        "masechta": "Kereisos",
        "key": "kereisos",
        "daf": 28
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Me'ilah",
        "key": "meilah",
        "starts": "2027-02-20"
      },
      "date": "2027-02-19"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Me'ilah",
        "key": "meilah",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Niddah",
        "key": "niddah",
        "starts": "2027-03-28"
      },
      "date": "2027-02-20"
    },
    "last": {
      "current_daf": {
        "masechta": "Me'ilah",
        "key": "meilah",
        "daf": 37
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Niddah",
        "key": "niddah",
        "starts": "2027-03-28"
      },
      "date": "2027-03-27"
    }
  },
  {
    "first": {
      "current_daf": {
        "masechta": "Niddah",
        "key": "niddah",
        "daf": 2
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Berachos",
        "key": "berachos",
        "starts": "2027-06-08"
      },
      "date": "2027-03-28"
    },
    "last": {
      "current_daf": {
        "masechta": "Niddah",
        "key": "niddah",
        "daf": 73
      },
      "cycle": {
        "number": 14,
        "label": "14th cycle"
      },
      "next_masechta": {
        "name": "Berachos",
        "key": "berachos",
        "starts": "2027-06-08"
      },
      "date": "2027-06-07"
    }
  }
];

/** PDF response for amud bet of a masechta's last daf, keyed as `key:daf`. */
export const PDF_FINAL_AMUD: Record<string, PdfAmudResponse> = {
  "berachos:64": {
    "error": "Amud does not exist",
    "message": "Masechta Berachos ends at daf 64a (amud aleph only)",
    "last_daf": 64,
    "last_amud": "a"
  },
  "shabbos:157": {
    "success": true,
    "masechta": "Shabbos",
    "daf": 157,
    "amud": "b",
    "page_number": 437,
    "pdf_url": "437.pdf",
    "file_size": 102450
  },
  "eruvin:105": {
    "error": "Amud does not exist",
    "message": "Masechta Eruvin ends at daf 105a (amud aleph only)",
    "last_daf": 105,
    "last_amud": "a"
  },
  "pesachim:121": {
    "success": true,
    "masechta": "Pesachim",
    "daf": 121,
    "amud": "b",
    "page_number": 884,
    "pdf_url": "884.pdf",
    "file_size": 78536
  },
  "shekalim:22": {
    "success": true,
    "masechta": "Shekalim",
    "daf": 22,
    "amud": "b",
    "page_number": 926,
    "pdf_url": "926.pdf",
    "file_size": 80164
  },
  "yoma:88": {
    "error": "Amud does not exist",
    "message": "Masechta Yoma ends at daf 88a (amud aleph only)",
    "last_daf": 88,
    "last_amud": "a"
  },
  "sukkah:56": {
    "success": true,
    "masechta": "Sukkah",
    "daf": 56,
    "amud": "b",
    "page_number": 1209,
    "pdf_url": "1209.pdf",
    "file_size": 140396
  },
  "beitzah:40": {
    "success": true,
    "masechta": "Beitzah",
    "daf": 40,
    "amud": "b",
    "page_number": 1287,
    "pdf_url": "1287.pdf",
    "file_size": 84256
  },
  "rosh-hashanah:35": {
    "error": "Amud does not exist",
    "message": "Masechta Rosh HaShanah ends at daf 35a (amud aleph only)",
    "last_daf": 35,
    "last_amud": "a"
  },
  "taanis:31": {
    "error": "Amud does not exist",
    "message": "Masechta Ta'anis ends at daf 31a (amud aleph only)",
    "last_daf": 31,
    "last_amud": "a"
  },
  "megillah:32": {
    "error": "Amud does not exist",
    "message": "Masechta Megillah ends at daf 32a (amud aleph only)",
    "last_daf": 32,
    "last_amud": "a"
  },
  "moed-katan:29": {
    "error": "Amud does not exist",
    "message": "Masechta Moed Katan ends at daf 29a (amud aleph only)",
    "last_daf": 29,
    "last_amud": "a"
  },
  "chagigah:27": {
    "error": "Amud does not exist",
    "message": "Masechta Chagigah ends at daf 27a (amud aleph only)",
    "last_daf": 27,
    "last_amud": "a"
  },
  "yevamos:122": {
    "error": "Amud does not exist",
    "message": "Masechta Yevamos ends at daf 122a (amud aleph only)",
    "last_daf": 122,
    "last_amud": "a"
  },
  "kesubos:112": {
    "success": true,
    "masechta": "Kesubos",
    "daf": 112,
    "amud": "b",
    "page_number": 2044,
    "pdf_url": "2044.pdf",
    "file_size": 105013
  },
  "nedarim:91": {
    "success": true,
    "masechta": "Nedarim",
    "daf": 91,
    "amud": "b",
    "page_number": 2224,
    "pdf_url": "2224.pdf",
    "file_size": 146084
  },
  "nazir:66": {
    "success": true,
    "masechta": "Nazir",
    "daf": 66,
    "amud": "b",
    "page_number": 2354,
    "pdf_url": "2354.pdf",
    "file_size": 154399
  },
  "sotah:49": {
    "success": true,
    "masechta": "Sotah",
    "daf": 49,
    "amud": "b",
    "page_number": 2450,
    "pdf_url": "2450.pdf",
    "file_size": 89809
  },
  "gittin:90": {
    "success": true,
    "masechta": "Gittin",
    "daf": 90,
    "amud": "b",
    "page_number": 2628,
    "pdf_url": "2628.pdf",
    "file_size": 97063
  },
  "kiddushin:82": {
    "success": true,
    "masechta": "Kiddushin",
    "daf": 82,
    "amud": "b",
    "page_number": 2790,
    "pdf_url": "2790.pdf",
    "file_size": 94752
  },
  "bava-kamma:119": {
    "success": true,
    "masechta": "Bava Kamma",
    "daf": 119,
    "amud": "b",
    "page_number": 3026,
    "pdf_url": "3026.pdf",
    "file_size": 81820
  },
  "bava-metzia:119": {
    "error": "Amud does not exist",
    "message": "Masechta Bava Metzia ends at daf 119a (amud aleph only)",
    "last_daf": 119,
    "last_amud": "a"
  },
  "bava-basra:176": {
    "success": true,
    "masechta": "Bava Basra",
    "daf": 176,
    "amud": "b",
    "page_number": 3611,
    "pdf_url": "3611.pdf",
    "file_size": 77598
  },
  "sanhedrin:113": {
    "success": true,
    "masechta": "Sanhedrin",
    "daf": 113,
    "amud": "b",
    "page_number": 3835,
    "pdf_url": "3835.pdf",
    "file_size": 107200
  },
  "makkos:24": {
    "success": true,
    "masechta": "Makkos",
    "daf": 24,
    "amud": "b",
    "page_number": 3881,
    "pdf_url": "3881.pdf",
    "file_size": 114798
  },
  "shevuos:49": {
    "success": true,
    "masechta": "Shevuos",
    "daf": 49,
    "amud": "b",
    "page_number": 3977,
    "pdf_url": "3977.pdf",
    "file_size": 84285
  },
  "avodah-zarah:76": {
    "success": true,
    "masechta": "Avodah Zarah",
    "daf": 76,
    "amud": "b",
    "page_number": 4127,
    "pdf_url": "4127.pdf",
    "file_size": 92160
  },
  "horayos:14": {
    "error": "Amud does not exist",
    "message": "Masechta Horayos ends at daf 14a (amud aleph only)",
    "last_daf": 14,
    "last_amud": "a"
  },
  "zevachim:120": {
    "success": true,
    "masechta": "Zevachim",
    "daf": 120,
    "amud": "b",
    "page_number": 4390,
    "pdf_url": "4390.pdf",
    "file_size": 99536
  },
  "menachos:110": {
    "error": "Amud does not exist",
    "message": "Masechta Menachos ends at daf 110a (amud aleph only)",
    "last_daf": 110,
    "last_amud": "a"
  },
  "chullin:142": {
    "error": "Amud does not exist",
    "message": "Masechta Chullin ends at daf 142a (amud aleph only)",
    "last_daf": 142,
    "last_amud": "a"
  },
  "bechoros:61": {
    "error": "Amud does not exist",
    "message": "Masechta Bechoros ends at daf 61a (amud aleph only)",
    "last_daf": 61,
    "last_amud": "a"
  },
  "arachin:34": {
    "error": "Amud does not exist",
    "message": "Masechta Arachin ends at daf 34a (amud aleph only)",
    "last_daf": 34,
    "last_amud": "a"
  },
  "temurah:34": {
    "error": "Amud does not exist",
    "message": "Masechta Temurah ends at daf 34a (amud aleph only)",
    "last_daf": 34,
    "last_amud": "a"
  },
  "kereisos:28": {
    "success": true,
    "masechta": "Kereisos",
    "daf": 28,
    "amud": "b",
    "page_number": 5191,
    "pdf_url": "5191.pdf",
    "file_size": 101591
  },
  "meilah:22": {
    "success": true,
    "masechta": "Me'ilah etc",
    "daf": 22,
    "amud": "b",
    "page_number": 5233,
    "pdf_url": "5233.pdf",
    "file_size": 88691
  },
  "kinim:25": {
    "success": true,
    "masechta": "Me'ilah etc",
    "daf": 25,
    "amud": "b",
    "page_number": 5239,
    "pdf_url": "5239.pdf",
    "file_size": 254319
  },
  "tamid:33": {
    "success": true,
    "masechta": "Me'ilah etc",
    "daf": 33,
    "amud": "b",
    "page_number": 5255,
    "pdf_url": "5255.pdf",
    "file_size": 81370
  },
  "middos:37": {
    "success": true,
    "masechta": "Me'ilah etc",
    "daf": 37,
    "amud": "b",
    "page_number": 5263,
    "pdf_url": "5263.pdf",
    "file_size": 91925
  },
  "niddah:73": {
    "error": "Amud does not exist",
    "message": "Masechta Niddah ends at daf 73a (amud aleph only)",
    "last_daf": 73,
    "last_amud": "a"
  }
};

export const PDF_MASECHTA_LIST: PdfMasechtaList = {
  "error": "Invalid masechta",
  "message": "Masechta 'invalid' not found",
  "available_masechtot": [
    "berachos",
    "shabbos",
    "eruvin",
    "pesachim",
    "shekalim",
    "yoma",
    "sukkah",
    "beitzah",
    "rosh-hashanah",
    "taanis",
    "megillah",
    "moed-katan",
    "chagigah",
    "yevamos",
    "kesubos",
    "nedarim",
    "nazir",
    "sotah",
    "gittin",
    "kiddushin",
    "bava-kamma",
    "bava-metzia",
    "bava-basra",
    "sanhedrin",
    "makkos",
    "shevuos",
    "avodah-zarah",
    "horayos",
    "zevachim",
    "menachos",
    "chullin",
    "bechoros",
    "arachin",
    "temurah",
    "kereisos",
    "meilah",
    "kinim",
    "tamid",
    "middos",
    "niddah"
  ]
};

export function capturedEndAmud(key: string, daf: number): "a" | "b" {
  const body = PDF_FINAL_AMUD[`${key}:${daf}`];
  if (!body) throw new Error(`No captured PDF response for ${key} ${daf}`);
  if ("last_amud" in body) return body.last_amud;
  return "b";
}
