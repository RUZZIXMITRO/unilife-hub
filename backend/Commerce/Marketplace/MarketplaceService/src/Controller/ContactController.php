<?php

namespace App\Controller;

use App\Entity\ContactLog;
use App\Repository\ContactLogRepository;
use App\Repository\MarketplaceListingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/marketplace')]
class ContactController extends AbstractController
{
    public function __construct(
        private ContactLogRepository $contactRepo,
        private MarketplaceListingRepository $listingRepo,
        private EntityManagerInterface $em
    ) {}

    #[Route('/contact/{listingId}', methods: ['POST'])]
    public function contact(int $listingId, Request $request): JsonResponse
    {
        $buyerId = $request->headers->get('X-User-Id');
        if (!$buyerId) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $listing = $this->listingRepo->find($listingId);
        if (!$listing || $listing->getStatus() !== 'approved') {
            return $this->json(['success' => false, 'message' => 'Annonce introuvable'], 404);
        }

        $log = new ContactLog();
        $log->setListingId($listingId);
        $log->setBuyerId((int)$buyerId);

        $this->em->persist($log);
        $this->em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Contact enregistré',
            'data' => [
                'phone' => $listing->getPhone(),
                'email' => $listing->getEmail(),
            ]
        ]);
    }
}