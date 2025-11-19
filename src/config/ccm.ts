// src/config/ccm.ts

export type CcmKey = "ccm1" | "ccm2";

export type TagConfigNumber = {
  tag: string;
  label: string;
  unit?: string;
  decimals?: number;
};

export type TagConfigBool = {
  tag: string;
  label: string;
};

export type CcmConfig = {
  key: CcmKey;
  displayName: string;
  numericTags: TagConfigNumber[];
  boolTags: TagConfigBool[];
};

export const CCM_CONFIGS: Record<CcmKey, CcmConfig> = {
  ccm1: {
    key: "ccm1",
    displayName: "CCM 1",

    // Cards numéricos da grade (inclui POTÊNCIA)
    numericTags: [
      {
        tag: "CCM1_POTENCIA",
        label: "POTÊNCIA",
        unit: "kVA",
        decimals: 1,
      },

      {
        tag: "CCM1_TENSAO_LL_L1L2",
        label: "TENSÃO LL L1-L2",
        unit: "V",
        decimals: 0,
      },
      {
        tag: "CCM1_TENSAO_LL_L2L3",
        label: "TENSÃO LL L2-L3",
        unit: "V",
        decimals: 0,
      },
      {
        tag: "CCM1_TENSAO_LL_L3L1",
        label: "TENSÃO LL L3-L1",
        unit: "V",
        decimals: 0,
      },

      {
        tag: "CCM1_TENSAO_LN_L1N",
        label: "TENSÃO LN L1-N",
        unit: "V",
        decimals: 0,
      },
      {
        tag: "CCM1_TENSAO_LN_L2N",
        label: "TENSÃO LN L2-N",
        unit: "V",
        decimals: 0,
      },
      {
        tag: "CCM1_TENSAO_LN_L3N",
        label: "TENSÃO LN L3-N",
        unit: "V",
        decimals: 0,
      },

      {
        tag: "CCM1_CORRENTE_L1",
        label: "CORRENTE L1",
        unit: "A",
        decimals: 0,
      },
      {
        tag: "CCM1_CORRENTE_L2",
        label: "CORRENTE L2",
        unit: "A",
        decimals: 0,
      },
      {
        tag: "CCM1_CORRENTE_L3",
        label: "CORRENTE L3",
        unit: "A",
        decimals: 0,
      },

      {
        tag: "CCM1_FATOR_POTENCIA",
        label: "FATOR DE POTÊNCIA",
        decimals: 2,
      },
      {
        tag: "CCM1_FREQUENCIA",
        label: "FREQUÊNCIA",
        unit: "Hz",
        decimals: 1,
      },
      {
        tag: "CCM1_CONSUMO_TOTAL",
        label: "CONSUMO TOTAL",
        unit: "kWh",
        decimals: 0,
      },

      {
        tag: "CCM1_TEMP_PAINEL",
        label: "TEMPERATURA PAINEL (CCM)",
        unit: "°C",
        decimals: 1,
      },
    ],

    // Sem cards booleanos por enquanto
    boolTags: [],
  },

  ccm2: {
    key: "ccm2",
    displayName: "CCM 2",

    numericTags: [
      {
        tag: "CCM2_POTENCIA",
        label: "POTÊNCIA",
        unit: "kVA",
        decimals: 1,
      },

      {
        tag: "CCM2_TENSAO_LL_L1L2",
        label: "TENSÃO LL L1-L2",
        unit: "V",
        decimals: 0,
      },
      {
        tag: "CCM2_TENSAO_LL_L2L3",
        label: "TENSÃO LL L2-L3",
        unit: "V",
        decimals: 0,
      },
      {
        tag: "CCM2_TENSAO_LL_L3L1",
        label: "TENSÃO LL L3-L1",
        unit: "V",
        decimals: 0,
      },

      {
        tag: "CCM2_TENSAO_LN_L1N",
        label: "TENSÃO LN L1-N",
        unit: "V",
        decimals: 0,
      },
      {
        tag: "CCM2_TENSAO_LN_L2N",
        label: "TENSÃO LN L2-N",
        unit: "V",
        decimals: 0,
      },
      {
        tag: "CCM2_TENSAO_LN_L3N",
        label: "TENSÃO LN L3-N",
        unit: "V",
        decimals: 0,
      },

      {
        tag: "CCM2_CORRENTE_L1",
        label: "CORRENTE L1",
        unit: "A",
        decimals: 0,
      },
      {
        tag: "CCM2_CORRENTE_L2",
        label: "CORRENTE L2",
        unit: "A",
        decimals: 0,
      },
      {
        tag: "CCM2_CORRENTE_L3",
        label: "CORRENTE L3",
        unit: "A",
        decimals: 0,
      },

      {
        tag: "CCM2_FATOR_POTENCIA",
        label: "FATOR DE POTÊNCIA",
        decimals: 2,
      },
      {
        tag: "CCM2_FREQUENCIA",
        label: "FREQUÊNCIA",
        unit: "Hz",
        decimals: 1,
      },
      {
        tag: "CCM2_CONSUMO_TOTAL",
        label: "CONSUMO TOTAL",
        unit: "kWh",
        decimals: 0,
      },

      {
        tag: "CCM2_TEMP_PAINEL",
        label: "TEMPERATURA PAINEL (CCM)",
        unit: "°C",
        decimals: 1,
      },
    ],

    boolTags: [],
  },
};

export const DEFAULT_CCM: CcmKey = "ccm1";

export function isCcmKey(v: string | undefined): v is CcmKey {
  return v === "ccm1" || v === "ccm2";
}
