import {
    Badge,
} from '@mantine/core';

export const Badges = {
    "open": <OpenBadge />,
    "invite_only": <InviteBadge />,
    "approval_required": <ApprovalBadge />,
    "recruiting": <RecruitingBadge />,
    "drafting": <DraftingBadge />,
    "freeagent": <FreeAgentBadge />,
    "inprogress": <InProgressBadge />,
    "completed": <CompletedBadge />,
}

export function OpenBadge() {
    return (
        <Badge color="green">open</Badge>
    );
}

export function InviteBadge() {
    return (
        <Badge color="pink">invite only</Badge>
    );
}

export function ApprovalBadge() {
    return (
        <Badge color="gray">approval required</Badge>
    );
}

export function RecruitingBadge() {
    return (
        <Badge color="purple">recruiting</Badge>
    );
}

export function DraftingBadge() {
    return (
        <Badge variant="gradient" gradient={{ from: "orange", to: "yellow", deg: 90 }}>drafting</Badge>
    );
}

export function FreeAgentBadge() {
    return (
        <Badge variant="gradient" gradient={{ from: "yellow", to: "teal", deg: 90 }}>free agent</Badge>
    );

}

export function InProgressBadge() {
    return (
        <Badge variant="gradient" gradient={{ from: "teal", to: "blue", deg: 90 }}>in progress</Badge>
    );
}

export function CompletedBadge() {
    return (
        <Badge variant="gradient" gradient={{ from: "blue", to: "lime", deg: 90 }}>completed</Badge>
    );
}