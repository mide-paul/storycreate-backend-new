import { ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";

export async function getAdvancedResults<T extends ObjectLiteral>(
  repository: Repository<T>,
  query: any,
  select?: string,
  sort?: string,
  page: number = 1,
  limit: number = 10,
  relations: string[] = [] 
): Promise<any> {
  const qb: SelectQueryBuilder<T> =  repository.createQueryBuilder("entity");

  relations.forEach((relation) => {
    qb.leftJoinAndSelect(`entity.${relation}`, relation);
  });

  for (const [key, value] of Object.entries(query)) {
    if (key !== "page" && key !== "limit") {  
      qb.andWhere(`entity.${key} = :${key}`, { [key]: value });
    }
  }

  if (select) {
    qb.select(select.split(",").map((field) => `entity.${field.trim()}`));
  }

  if (sort) {
    const sortFields = sort.split(",").map((field) => {
      const order = field.startsWith("-") ? "DESC" : "ASC";
      const fieldName = field.replace(/^-/, "");
      return { field: `entity.${fieldName}`, order };
    });

    sortFields.forEach(({ field, order }) => {
      return qb.addOrderBy(field, order as "DESC" | "ASC");
    });
  }

  qb.skip((page - 1) * limit).take(limit);

  const [results, total] = await qb.getManyAndCount();

  return {
    success: true,
    count: total,
    page,
    limit,
    data: results,
  };
}
