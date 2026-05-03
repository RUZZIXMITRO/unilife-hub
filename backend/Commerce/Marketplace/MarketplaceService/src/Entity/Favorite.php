<?php

namespace App\Entity;

use App\Repository\FavoriteRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FavoriteRepository::class)]
#[ORM\Table(name: 'marketplace_favorites')]
class Favorite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private int $userId;

    #[ORM\Column]
    private int $listingId;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
    public function getUserId(): int { return $this->userId; }
    public function setUserId(int $userId): self { $this->userId = $userId; return $this; }
    public function getListingId(): int { return $this->listingId; }
    public function setListingId(int $listingId): self { $this->listingId = $listingId; return $this; }
    public function getCreatedAt(): \DateTime { return $this->createdAt; }
    public function setCreatedAt(\DateTime $createdAt): self { $this->createdAt = $createdAt; return $this; }
}