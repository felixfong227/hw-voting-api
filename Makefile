db_bootstrap:
	docker-compose up -d db && \
	cd backend && \
	npm run prisma:db:push
	
bootstrap:
	cd frontend &&\
	# npm ci &&\
	cd ../backend &&\
	# npm ci &&\
	cd ../ &&\
	# make db_bootstrap &&\
	make bn; make fn
	
fn:
	npm run dev --prefix frontend
	
bn:
	npm run start:dev --prefix backend