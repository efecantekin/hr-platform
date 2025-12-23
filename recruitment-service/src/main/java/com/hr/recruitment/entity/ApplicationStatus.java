package com.hr.recruitment.entity;

public enum ApplicationStatus {
    // Ortak Statüler
    BASVURU_ALINDI,
    
    // Dış Aday Süreci
    YONETICIYE_ILETILDI,
    MULAKAT_PLANLANDI,
    IK_MULAKATI_YAPILDI,
    TEKNIK_MULAKAT_YAPILDI,
    MUSTERIYE_ILETILDI,
    MUSTERI_MULAKATI_YAPILDI,
    
    // Sonuç
    ONAYLANDI,
    REDDEDILDI
}