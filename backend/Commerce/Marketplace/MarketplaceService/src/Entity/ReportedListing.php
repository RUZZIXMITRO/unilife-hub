<?php

namespace App\Entity;

use App\Repository\ReportedListingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReportedListingRepository::class)]
#[ORM\Table(name: 'reported_listings')]
class ReportedListing
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private int $listingId;

    #[ORM\Column]
    private int $reporterId;

    #[ORM\Column(length: 255)]
    private string $reason;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
    public function getListingId(): int { return $this->listingId; }
    public function setListingId(int $listingId): self { $this->listingId = $listingId; return $this; }
    public function getReporterId(): int { return $this->reporterId; }
    public function setReporterId(int $reporterId): self { $this->reporterId = $reporterId; return $this; }
    public function getReason(): string { return $this->reason; }
    public function setReason(string $reason): self { $this->reason = $reason; return $this; }
    public function getCreatedAt(): \DateTime { return $this->createdAt; }
    public function setCreatedAt(\DateTime $createdAt): self { $this->createdAt = $createdAt; return $this; }
}