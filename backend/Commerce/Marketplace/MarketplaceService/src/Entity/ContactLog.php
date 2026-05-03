<?php

namespace App\Entity;

use App\Repository\ContactLogRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ContactLogRepository::class)]
#[ORM\Table(name: 'contact_logs')]
class ContactLog
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private int $listingId;

    #[ORM\Column]
    private int $buyerId;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $contactedAt;

    public function __construct()
    {
        $this->contactedAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
    public function getListingId(): int { return $this->listingId; }
    public function setListingId(int $listingId): self { $this->listingId = $listingId; return $this; }
    public function getBuyerId(): int { return $this->buyerId; }
    public function setBuyerId(int $buyerId): self { $this->buyerId = $buyerId; return $this; }
    public function getContactedAt(): \DateTime { return $this->contactedAt; }
    public function setContactedAt(\DateTime $contactedAt): self { $this->contactedAt = $contactedAt; return $this; }
}