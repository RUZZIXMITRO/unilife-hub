<?php

namespace App\Entity;

use App\Repository\MarketplaceListingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MarketplaceListingRepository::class)]
#[ORM\Table(name: 'marketplace_listings')]
class MarketplaceListing
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private int $sellerId;

    #[ORM\Column(length: 255)]
    private string $title;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $price;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $category = null;

    #[ORM\Column(name: 'item_condition', length: 100, nullable: true)]
    private ?string $condition = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $email = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $imageUrls = null;

    #[ORM\Column(length: 50)]
    private string $status = 'pending';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $rejectionReason = null;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $createdAt;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
    public function getSellerId(): int { return $this->sellerId; }
    public function setSellerId(int $sellerId): self { $this->sellerId = $sellerId; return $this; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $title): self { $this->title = $title; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): self { $this->description = $description; return $this; }
    public function getPrice(): string { return $this->price; }
    public function setPrice(string $price): self { $this->price = $price; return $this; }
    public function getCategory(): ?string { return $this->category; }
    public function setCategory(?string $category): self { $this->category = $category; return $this; }
    public function getCondition(): ?string { return $this->condition; }
    public function setCondition(?string $condition): self { $this->condition = $condition; return $this; }
    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(?string $phone): self { $this->phone = $phone; return $this; }
    public function getEmail(): ?string { return $this->email; }
    public function setEmail(?string $email): self { $this->email = $email; return $this; }
    public function getImageUrls(): ?array { return $this->imageUrls; }
    public function setImageUrls(?array $imageUrls): self { $this->imageUrls = $imageUrls; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
    public function getRejectionReason(): ?string { return $this->rejectionReason; }
    public function setRejectionReason(?string $rejectionReason): self { $this->rejectionReason = $rejectionReason; return $this; }
    public function getCreatedAt(): \DateTime { return $this->createdAt; }
    public function setCreatedAt(\DateTime $createdAt): self { $this->createdAt = $createdAt; return $this; }
    public function getUpdatedAt(): \DateTime { return $this->updatedAt; }
    public function setUpdatedAt(\DateTime $updatedAt): self { $this->updatedAt = $updatedAt; return $this; }
}