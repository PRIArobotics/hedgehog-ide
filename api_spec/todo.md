# documentation
- [x] open project / create working copy
- [x] create project
- [x] list programs
- [x] delete program
- [x] rename project
- [x] show versions

- [x] execute program
- [x] show outputstream
- [x] write inputstream
- [x] stop execution

- [x] show filetree
- [x] delete file
- [x] load/show file
- [x] create file/directory
- [x] edit file

- [x] save as version
- [x] save file in working copy

- [x] read sensors
- [x] list sensors

- [x] write actors
- [x] list actors


# implementation
- [x] `GET /programs`
- [x] `POST /programs`
- [x] `DELETE /programs/{program_id}`
- [x] `GET /programs/{program_id}`
- [x] `PATCH /programs/{program_id}`

- [x] `GET /blobs/{program_id}/{blob_id}`
- [x] `GET /trees/{program_id}/{tree_id}`
- [x] `GET /versions/{program_id}`
- [x] `POST /versions/{program_id}`
- [x] `GET /versions/{program_id}/{version_id}`
- [ ] `GET /versions/{program_id}/{version_id}/parents`

- [x] `POST /directories/{program_id}`
- [x] `DELETE /directories/{program_id}/{directory_id}`
- [x] `GET /directories/{program_id}/{directory_id}`
- [x] `PATCH /directories/{program_id}/{directory_id}`

- [x] `POST /files/{program_id}`
- [x] `DELETE /files/{program_id}/{file_id}`
- [x] `GET /files/{program_id}/{file_id}`
- [x] `PATCH /files/{program_id}/{file_id}`
- [x] `GET /files/{program_id}/{file_id}/content`

- [x] `GET /sensors`
- [x] `GET /sensors/{sensor_id}`
- [x] `PATCH /sensors/{sensor_id}`

- [ ] `GET /servos`
- [ ] `GET /servos/{servo_id}`
- [x] `PATCH /sensors/{servo_id}`

- [ ] `GET /motors`
- [ ] `GET /motors/{motor_id}`
- [x] `PATCH /motors/{motor_id}`

- [x] `POST /processes`
- [x] `DELETE /processes/{pid}`
- [x] `GET /processes/{pid}`
- [x] `GET /processes/{pid}/stdout`
- [x] `GET /processes/{pid}/stderr`
- [x] `PATCH /processes/{pid}/stdin`
