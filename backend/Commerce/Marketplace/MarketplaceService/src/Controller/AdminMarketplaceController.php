<?php

namespace App\Controller;

use App\Repository\MarketplaceListingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/marketplace/admin')]
class AdminMarketplaceController extends AbstractController
{
    public function __construct(
        private MarketplaceListingRepository $listingRepo,
        private EntityManagerInterface $em
    ) {}

    private function isAdmin(Request $request): bool
    {
        return $request->headers->get('X-User-Role') === 'ADMIN';
    }

    #[Route('/listings', methods: ['GET'])]
    public function allListings(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return $this->json(['success' => false, 'message' => 'Accès refusé'], 403);
        }

        $status = $request->query->get('status');
        $listings = $status
            ? $this->listingRepo->findByStatus($status)
            : $this->listingRepo->findAll();

        return $this->json([
            'success' => true,
            'data' => array_map(fn($l) => $this->format($l), $listings)
        ]);
    }

    #[Route('/listings/{id}/approve', methods: ['POST'])]
    public function approve(int $id, Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return $this->json(['success' => false, 'message' => 'Accès refusé'], 403);
        }

        $listing = $this->listingRepo->find($id);
        if (!$listing) {
            return $this->json(['success' => false, 'message' => 'Annonce introuvable'], 404);
        }

        $listing->setStatus('approved');
        $listing->setRejectionReason(null);
        $this->em->flush();

        return $this->json(['success' => true, 'message' => 'Annonce approuvée']);
    }

    #[Route('/listings/{id}/reject', methods: ['POST'])]
    public function reject(int $id, Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return $this->json(['success' => false, 'message' => 'Accès refusé'], 403);
        }

        $listing = $this->listingRepo->find($id);
        if (!$listing) {
            return $this->json(['success' => false, 'message' => 'Annonce introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $listing->setStatus('rejected');
        $listing->setRejectionReason($data['reason'] ?? 'Non conforme');
        $this->em->flush();

        return $this->json(['success' => true, 'message' => 'Annonce rejetée']);
    }

    #[Route('/listings/{id}', methods: ['DELETE'])]
    public function delete(int $id, Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return $this->json(['success' => false, 'message' => 'Accès refusé'], 403);
        }

        $listing = $this->listingRepo->find($id);
        if (!$listing) {
            return $this->json(['success' => false, 'message' => 'Annonce introuvable'], 404);
        }

        $this->em->remove($listing);
        $this->em->flush();

        return $this->json(['success' => true, 'message' => 'Annonce supprimée']);
    }

    #[Route('/stats', methods: ['GET'])]
    public function stats(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return $this->json(['success' => false, 'message' => 'Accès refusé'], 403);
        }

        $all      = $this->listingRepo->findAll();
        $pending  = $this->listingRepo->findByStatus('pending');
        $approved = $this->listingRepo->findByStatus('approved');
        $rejected = $this->listingRepo->findByStatus('rejected');

        return $this->json([
            'success' => true,
            'data' => [
                'total'    => count($all),
                'pending'  => count($pending),
                'approved' => count($approved),
                'rejected' => count($rejected),
            ]
        ]);
    }

    private function format($l): array
{
    return [
        'id'              => $l->getId(),
        'sellerId'        => $l->getSellerId(),
        'title'           => $l->getTitle(),
        'description'     => $l->getDescription(),
        'price'           => $l->getPrice(),
        'category'        => $l->getCategory(),
        'condition'       => $l->getCondition(),
        'imageUrls'       => $l->getImageUrls(),
        'status'          => $l->getStatus(),
        'rejectionReason' => $l->getRejectionReason(),
        'createdAt'       => $l->getCreatedAt()->format('Y-m-d H:i:s'),
    ];
}
}