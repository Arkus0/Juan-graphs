export interface IOperacion {
  Id: number;
  Cod_IOE: string;
  Nombre: string;
  Codigo: string;
  Referencia?: string;
}

export interface ITabla {
  Id: number;
  Nombre: string;
  Codigo: string;
  Anyo_Periodo_Ini?: string;
  Anyo_Periodo_Fin?: string;
  FechaRef_fin?: number;
}

export interface IDato {
  Fecha: number; // timestamp
  FK_Periodo: number;
  FK_Estado: number;
  Valor: number;
  Anyo?: number;
}

export interface ISerie {
  Id: number;
  Nombre: string;
  Data: IDato[];
}
