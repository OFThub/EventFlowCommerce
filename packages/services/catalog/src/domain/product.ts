export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export class ProductAggregate {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public price: number,
    public category: string,
    public stock: number,
    public createdAt: string,
    public updatedAt: string
  ) {}

  static create(
    id: string,
    name: string,
    description: string,
    price: number,
    category: string,
    stock: number
  ): ProductAggregate {
    const now = new Date().toISOString();
    return new ProductAggregate(id, name, description, price, category, stock, now, now);
  }

  updatePrice(newPrice: number): void {
    this.price = newPrice;
    this.updatedAt = new Date().toISOString();
  }

  updateStock(newStock: number): void {
    this.stock = newStock;
    this.updatedAt = new Date().toISOString();
  }

  toDTO(): Product {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      category: this.category,
      stock: this.stock,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}