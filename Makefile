.PHONY: run test

run:
	node index.js $(if $(WEEK),--week $(WEEK)) $(if $(LEAGUE),--league $(LEAGUE))

test:
	node --test
