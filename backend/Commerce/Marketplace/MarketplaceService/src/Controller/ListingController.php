<?php

namespace App\Controller;

use App\Entity\MarketplaceListing;
use App\Repository\MarketplaceListingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/marketplace')]
class ListingController extends AbstractController
{
    public function __construct(
        private MarketplaceListingRepository $listingRepo,
        private EntityManagerInterface $em
    ) {}

    #[Route('/listings', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $listings = $this->listingRepo->findApproved();
        return $this->json($this->formatListings($listings));
    }

    #[Route('/listings', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $sellerId = $request->headers->get('X-User-Id');
        if (!$sellerId) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['title']) || empty($data['price'])) {
            return $this->json(['success' => false, 'message' => 'Titre et prix obligatoires'], 400);
        }

        $listing = new MarketplaceListing();
        $listing->setSellerId((int)$sellerId);
        $listing->setTitle($data['title']);
        $listing->setDescription($data['description'] ?? null);
        $listing->setPrice($data['price']);
        $listing->setCategory($data['category'] ?? null);
        $listing->setCondition($data['condition'] ?? null);
        $listing->setPhone($data['phone'] ?? null);
        $listing->setEmail($data['email'] ?? null);
        $listing->setImageUrls($data['imageUrls'] ?? null);
        $listing->setStatus('pending');

        $this->em->persist($listing);
        $this->em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Annonce publiée, en attente de validation',
            'data' => $this->formatListing($listing)
        ], 201);
    }

    // ===== ROUTES STATIQUES AVANT {id} =====
    #[Route('/listings/my', methods: ['GET'])]
    public function myListings(Request $request): JsonResponse
    {
        $sellerId = $request->headers->get('X-User-Id');
        if (!$sellerId) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $listings = $this->listingRepo->findBySellerId((int)$sellerId);
        return $this->json(['success' => true, 'data' => $this->formatListings($listings)]);
    }

    #[Route('/listings/search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $query = $request->query->get('q', '');
        $listings = $this->listingRepo->search($query);
        return $this->json(['success' => true, 'data' => $this->formatListings($listings)]);
    }

    #[Route('/listings/category/{category}', methods: ['GET'])]
    public function byCategory(string $category): JsonResponse
    {
        $listings = $this->listingRepo->findByCategory($category);
        return $this->json(['success' => true, 'data' => $this->formatListings($listings)]);
    }

    // ===== ROUTES DYNAMIQUES {id} APRÈS =====
    #[Route('/listings/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $listing = $this->listingRepo->find($id);
        if (!$listing) {
            return $this->json(['success' => false, 'message' => 'Annonce introuvable'], 404);
        }
        return $this->json(['success' => true, 'data' => $this->formatListing($listing)]);
    }

    #[Route('/listings/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $sellerId = $request->headers->get('X-User-Id');
        $listing = $this->listingRepo->find($id);

        if (!$listing) {
            return $this->json(['success' => false, 'message' => 'Annonce introuvable'], 404);
        }

        if ($listing->getSellerId() !== (int)$sellerId) {
            return $this->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title']))       $listing->setTitle($data['title']);
        if (isset($data['description'])) $listing->setDescription($data['description']);
        if (isset($data['price']))       $listing->setPrice($data['price']);
        if (isset($data['category']))    $listing->setCategory($data['category']);
        if (isset($data['condition']))   $listing->setCondition($data['condition']);
        if (isset($data['phone']))       $listing->setPhone($data['phone']);
        if (isset($data['email']))       $listing->setEmail($data['email']);
        if (isset($data['imageUrls']))   $listing->setImageUrls($data['imageUrls']);
        $listing->setUpdatedAt(new \DateTime());

        $this->em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Annonce modifiée',
            'data' => $this->formatListing($listing)
        ]);
    }

    #[Route('/listings/{id}', methods: ['DELETE'])]
    public function delete(int $id, Request $request): JsonResponse
    {
        $sellerId = $request->headers->get('X-User-Id');
        $listing = $this->listingRepo->find($id);

        if (!$listing) {
            return $this->json(['success' => false, 'message' => 'Annonce introuvable'], 404);
        }

        if ($listing->getSellerId() !== (int)$sellerId) {
            return $this->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }

        $this->em->remove($listing);
        $this->em->flush();

        return $this->json(['success' => true, 'message' => 'Annonce supprimée']);
    }

    private function formatListing(MarketplaceListing $l): array
    {
        return [
            'id'              => $l->getId(),
            'sellerId'        => $l->getSellerId(),
            'title'           => $l->getTitle(),
            'description'     => $l->getDescription(),
            'price'           => $l->getPrice(),
            'category'        => $l->getCategory(),
            'condition'       => $l->getCondition(),
            'phone'           => $l->getPhone(),
            'email'           => $l->getEmail(),
            'imageUrls'       => $l->getImageUrls(),
            'status'          => $l->getStatus(),
            'rejectionReason' => $l->getRejectionReason(),
            'createdAt'       => $l->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt'       => $l->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
    }

    private function formatListings(array $listings): array
    {
        return array_map(fn($l) => $this->formatListing($l), $listings);
    }
}