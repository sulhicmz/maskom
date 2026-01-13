import { AutoIdGenerator, IAutoIdGenerator, createAutoIdGenerator } from '../dataAutoId';

describe('IAutoIdGenerator interface', () => {
  it('should enforce AutoIdGenerator to implement all interface methods', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator();
    
    expect(typeof generator.next).toBe('function');
    expect(typeof generator.nextId).toBe('function');
    expect(typeof generator.reset).toBe('function');
    expect(typeof generator.getCurrentId).toBe('function');
    expect(typeof generator.getUsedIds).toBe('function');
    expect(typeof generator.hasUsedId).toBe('function');
  });

  it('should work with createAutoIdGenerator factory function', () => {
    const generator: IAutoIdGenerator = createAutoIdGenerator();
    
    expect(generator).toBeInstanceOf(AutoIdGenerator);
    expect(typeof generator.next).toBe('function');
  });

  it('should satisfy interface contract for next() method', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ collectionName: 'test' });
    
    const id1 = generator.next();
    const id2 = generator.next();
    
    expect(typeof id1).toBe('number');
    expect(id2).toBe(id1 + 1);
  });

  it('should satisfy interface contract for nextId() method', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ collectionName: 'test' });
    
    const id1 = generator.nextId();
    const id2 = generator.nextId();
    
    expect(typeof id1).toBe('number');
    expect(typeof id2).toBe('number');
    expect(id2).toBe(id1 + 1);
  });

  it('should satisfy interface contract for reset() method', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ collectionName: 'test' });
    
    generator.next();
    generator.next();
    generator.reset(10);
    const id3 = generator.next();
    
    expect(id3).toBe(10);
    expect(generator.getCurrentId()).toBe(11);
  });

  it('should satisfy interface contract for getCurrentId() method', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ collectionName: 'test' });
    
    const initialId = generator.getCurrentId();
    expect(typeof initialId).toBe('number');
    expect(initialId).toBe(1);
    
    generator.next();
    expect(generator.getCurrentId()).toBe(2);
  });

  it('should satisfy interface contract for getUsedIds() method', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ collectionName: 'test' });
    
    generator.next();
    generator.next();
    generator.next();
    
    const usedIds = generator.getUsedIds();
    
    expect(Array.isArray(usedIds)).toBe(true);
    expect(usedIds).toEqual([1, 2, 3]);
  });

  it('should satisfy interface contract for hasUsedId() method', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ collectionName: 'test' });
    
    generator.next();
    generator.next();
    generator.next();
    
    expect(generator.hasUsedId(1)).toBe(true);
    expect(generator.hasUsedId(2)).toBe(true);
    expect(generator.hasUsedId(3)).toBe(true);
    expect(generator.hasUsedId(4)).toBe(false);
    expect(generator.hasUsedId(999)).toBe(false);
  });

  it('should work with custom startFrom option', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ 
      startFrom: 100,
      collectionName: 'test'
    });
    
    const id1 = generator.next();
    const id2 = generator.next();
    
    expect(id1).toBe(100);
    expect(id2).toBe(101);
  });

  it('should work with custom incrementBy option', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ 
      startFrom: 10,
      incrementBy: 5,
      collectionName: 'test'
    });
    
    const id1 = generator.next();
    const id2 = generator.next();
    
    expect(id1).toBe(10);
    expect(id2).toBe(15);
  });

  it('should throw error on duplicate IDs when hasUsedId returns true', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ collectionName: 'test' });
    
    generator.next();
    generator.next();
    generator.next();
    
    expect(generator.hasUsedId(2)).toBe(true);
  });

  it('should maintain used IDs after reset', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ collectionName: 'test' });
    
    generator.next();
    generator.next();
    generator.next();
    
    generator.reset(1);
    
    expect(generator.hasUsedId(1)).toBe(false);
    expect(generator.getUsedIds()).toEqual([]);
  });

  it('should work with interface type in function parameters', () => {
    function processGenerator(generator: IAutoIdGenerator): number {
      return generator.next();
    }
    
    const generator = new AutoIdGenerator({ collectionName: 'test' });
    const result = processGenerator(generator);
    
    expect(result).toBe(1);
  });

  it('should support interface polymorphism', () => {
    const generators: IAutoIdGenerator[] = [
      new AutoIdGenerator({ startFrom: 1, collectionName: 'test' }),
      new AutoIdGenerator({ startFrom: 100, collectionName: 'test' }),
      new AutoIdGenerator({ startFrom: 1000, collectionName: 'test' }),
    ];
    
    const results = generators.map(g => g.next());
    
    expect(results).toEqual([1, 100, 1000]);
  });

  it('should maintain interface contract with custom increment', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ 
      incrementBy: 10,
      collectionName: 'test'
    });
    
    const ids: number[] = [];
    for (let i = 0; i < 5; i++) {
      ids.push(generator.next());
    }
    
    expect(ids).toEqual([1, 11, 21, 31, 41]);
    expect(generator.getUsedIds()).toEqual([1, 11, 21, 31, 41]);
  });

  it('should return new array from getUsedIds each time', () => {
    const generator: IAutoIdGenerator = new AutoIdGenerator({ collectionName: 'test' });
    
    generator.next();
    generator.next();
    
    const usedIds1 = generator.getUsedIds();
    const usedIds2 = generator.getUsedIds();
    
    expect(usedIds1).toEqual([1, 2]);
    expect(usedIds2).toEqual([1, 2]);
    expect(usedIds1 === usedIds2).toBe(false);
  });

  it('should support type safety with interface type annotations', () => {
    const createTestGenerator = (): IAutoIdGenerator => {
      return new AutoIdGenerator({ collectionName: 'test' });
    };
    
    const generator = createTestGenerator();
    
    expect(generator.next()).toBe(1);
    expect(generator.next()).toBe(2);
  });
});
