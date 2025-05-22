interface RestrictionGroup {
  name: string;
  restrictions: string[];
  message: string;
}

const INCOMPATIBLE_GROUPS: RestrictionGroup[] = [
  {
    name: 'Dietas vegetarianas',
    restrictions: ['Vegetariano', 'Vegano'],
    message: 'No puedes seleccionar Vegetariano y Vegano al mismo tiempo. El veganismo es una forma más estricta de vegetarianismo.'
  },
  {
    name: 'Dietas específicas',
    restrictions: ['Dieta mediterránea', 'Dieta keto', 'Low carb'],
    message: 'No puedes seleccionar Dieta mediterránea junto con Dieta keto o Low carb, ya que son enfoques dietéticos diferentes.'
  },
  {
    name: 'Dietas y veganismo',
    restrictions: ['Dieta mediterránea', 'Vegano'],
    message: 'La dieta mediterránea incluye productos de origen animal, por lo que no es compatible con el veganismo.'
  },
  {
    name: 'Dietas y vegetarianismo',
    restrictions: ['Dieta keto', 'Vegetariano'],
    message: 'La dieta keto es alta en proteínas animales, por lo que es difícil de seguir siendo vegetariano.'
  }
];

export function validateRestrictions(selectedRestrictions: string[]): { isValid: boolean; message?: string } {
  for (const group of INCOMPATIBLE_GROUPS) {
    const selectedInGroup = group.restrictions.filter(r => selectedRestrictions.includes(r));
    if (selectedInGroup.length > 1) {
      return {
        isValid: false,
        message: group.message
      };
    }
  }
  return { isValid: true };
}

export function getRestrictionGroups(): RestrictionGroup[] {
  return INCOMPATIBLE_GROUPS;
} 