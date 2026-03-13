//Утилиты для форматирования данных
export class FormatUtil {
  static formatCategory(category: { categoryId: number; name: string; slug?: string | null } | null) {
    if (!category) {
      return null;
    }

    return {
      id: category.categoryId,
      name: category.name,
      slug: category.slug || null,
    };
  }

  static formatCategories(
    categories: Array<{ categoryId: number; name: string; slug?: string | null }>,
  ): Array<{ id: number; name: string; slug: string | null }> {
    return categories.map((cat) => ({
      id: cat.categoryId,
      name: cat.name,
      slug: cat.slug || null,
    }));
  }

  static formatProductCharacteristics(
    characteristics: Array<{
      value: string;
      characteristicName: {
        name: string;
        valueType?: string;
      };
    }>,
  ): Array<{
    name: string;
    value: string;
    valueType?: string;
  }> {
    return characteristics.map((char) => ({
      name: char.characteristicName.name,
      value: char.value,
      valueType: char.characteristicName.valueType,
    }));
  }
}

