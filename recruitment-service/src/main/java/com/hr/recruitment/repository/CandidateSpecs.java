package com.hr.recruitment.repository; // veya .specs paketi

import com.hr.recruitment.entity.Candidate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class CandidateSpecs {

    public static Specification<Candidate> withDynamicFilter(
            String technology, 
            Integer minExp, 
            String university, 
            String department, 
            String referenceType
    ) {
        // Başlangıçta boş bir filtre oluşturuyoruz (Herkesi getirir)
        Specification<Candidate> spec = Specification.where(null);

        // 1. Teknoloji Filtresi
        if (StringUtils.hasText(technology)) {
            // Burada 'root' ismini kullanabiliriz çünkü dışarıda bir 'root' tanımı yok
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("technologies")), "%" + technology.toLowerCase() + "%"));
        }

        // 2. Tecrübe Filtresi
        if (minExp != null) {
            spec = spec.and((root, query, cb) -> 
                cb.ge(root.get("experienceYears"), minExp));
        }

        // 3. Üniversite Filtresi
        if (StringUtils.hasText(university)) {
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("university")), "%" + university.toLowerCase() + "%"));
        }

        // 4. Bölüm Filtresi
        if (StringUtils.hasText(department)) {
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("department")), "%" + department.toLowerCase() + "%"));
        }

        // 5. Referans Tipi
        if (StringUtils.hasText(referenceType)) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("referenceType"), referenceType));
        }

        // Oluşturduğumuz zinciri döndürüyoruz
        return spec;
    }
}