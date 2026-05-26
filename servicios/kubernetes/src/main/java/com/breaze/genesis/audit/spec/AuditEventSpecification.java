package com.breaze.genesis.audit.spec;

import com.breaze.genesis.audit.model.AuditEvent;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class AuditEventSpecification {

    private AuditEventSpecification() {
    }

    public static Specification<AuditEvent> filterBy(
            String action,
            String username,
            String role,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();

            if (action != null && !action.isBlank()) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(root.get("action"), action)
                );
            }

            if (username != null && !username.isBlank()) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("username")),
                                "%" + username.toLowerCase() + "%"
                        )
                );
            }

            if (role != null && !role.isBlank()) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(root.get("role"), role)
                );
            }

            if (startDate != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("timestamp"), startDate)
                );
            }

            if (endDate != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.lessThanOrEqualTo(root.get("timestamp"), endDate)
                );
            }

            return predicate;
        };
    }
}