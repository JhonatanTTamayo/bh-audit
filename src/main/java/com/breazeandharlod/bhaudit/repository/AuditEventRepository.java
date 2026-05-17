package com.breazeandharlod.bhaudit.repository;

import com.breazeandharlod.bhaudit.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, String> {

    @Query("SELECT e FROM AuditEvent e WHERE e.userId = :userId ORDER BY e.actionDateTime DESC")
    Page<AuditEvent> findByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT e FROM AuditEvent e WHERE e.userRole = :userRole ORDER BY e.actionDateTime DESC")
    Page<AuditEvent> findByUserRole(@Param("userRole") AuditEvent.UserRole userRole, Pageable pageable);

    @Query("SELECT e FROM AuditEvent e WHERE e.actionType = :actionType ORDER BY e.actionDateTime DESC")
    Page<AuditEvent> findByActionType(@Param("actionType") AuditEvent.AuditActionType actionType, Pageable pageable);

    @Query("SELECT e FROM AuditEvent e WHERE e.actionDateTime BETWEEN :startDate AND :endDate ORDER BY e.actionDateTime DESC")
    Page<AuditEvent> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT e FROM AuditEvent e WHERE e.userId = :userId AND e.actionType = :actionType AND e.actionDateTime BETWEEN :startDate AND :endDate ORDER BY e.actionDateTime DESC")
    Page<AuditEvent> findByMultipleFilters(
            @Param("userId") String userId,
            @Param("actionType") AuditEvent.AuditActionType actionType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT e FROM AuditEvent e ORDER BY e.actionDateTime DESC")
    List<AuditEvent> findAllOrderByDateDesc();
}