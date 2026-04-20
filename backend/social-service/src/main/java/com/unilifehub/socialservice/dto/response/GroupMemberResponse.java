package com.unilifehub.socialservice.dto.response;

import com.unilifehub.socialservice.entity.GroupMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMemberResponse {

    private Long id;
    private Long userId;
    private Long groupId;
    private GroupMember.MemberRole role;
    private GroupMember.MemberStatus status;
    private LocalDateTime joinedAt;
}