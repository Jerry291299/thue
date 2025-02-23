export interface IMaterial {
    _id: string,
    name: string,
    status: 'active' | 'deactive';
}

export type IMaterialLite = Pick<IMaterial, 'name'>;