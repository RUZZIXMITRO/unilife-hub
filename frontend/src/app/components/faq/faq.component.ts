import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  faqs = [
    {
      question: 'UniLife Hub est-il gratuit ?',
      answer: 'Oui, UniLife Hub offre un accès gratuit à toutes les fonctionnalités essentielles pour les étudiants. Nous croyons en l\'accessibilité de l\'éducation pour tous.',
      isOpen: false
    },

    {
      question: 'Puis-je utiliser UniLife Hub sur mobile ?',
      answer: 'Absolument ! UniLife Hub est entièrement responsive et fonctionne parfaitement sur tous les appareils : smartphones, tablettes et ordinateurs.',
      isOpen: false
    },
    {
      question: 'Comment fonctionne le marketplace ?',
      answer: 'Le marketplace permet aux étudiants d\'acheter et de vendre du matériel scolaire de manière sécurisée. Toutes les transactions sont protégées et vous pouvez communiquer directement avec les vendeurs.',
      isOpen: false
    },
    {
      question: 'Quelles universités sont partenaires ?',
      answer: 'Nous collaborons avec plus de 50 universités et grandes écoles en France et à l\'international. Consultez notre section partenaires pour plus d\'informations.',
      isOpen: false
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}